import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';

// Free JSON storage - no auth needed
const JSONBLOB_ID = '019fa219-474f-7990-906c-c2d5199a89fc';
const JSONBLOB_URL = `https://jsonblob.com/api/jsonBlob/${JSONBLOB_ID}`;

async function getSubmittedProjects(): Promise<any[]> {
  try {
    const res = await fetch(JSONBLOB_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects || [];
  } catch (e) {
    console.error('Failed to fetch submitted projects:', e);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const submitted = await getSubmittedProjects();

  // Merge base projects + submitted projects, deduplicate by id
  const baseIds = new Set(projects.map((p) => p.id));
  const uniqueSubmitted = submitted.filter((p: any) => !baseIds.has(p.id));

  const merged = [
    ...projects,
    ...uniqueSubmitted.map((p: any) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      description: p.description,
      category: p.category,
      twitter: p.twitter,
      website: p.website,
      status: p.status,
      tags: p.tags,
      spotlight: false,
      logo: p.logo || undefined,
      submitted: true,
      submittedAt: p.submittedAt,
    })),
  ];

  let filtered = [...merged];

  if (category && category !== 'all') {
    filtered = filtered.filter((p: any) => p.category === category);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((p: any) => p.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t: string) => t.includes(q))
    );
  }

  return NextResponse.json({
    projects: filtered,
    total: filtered.length,
    totalAll: merged.length,
    baseCount: projects.length,
    submittedCount: uniqueSubmitted.length,
  });
}
