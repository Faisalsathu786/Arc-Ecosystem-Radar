import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';

const GITHUB_PAT = process.env.GITHUB_PAT || 'ghp_24zs9N1DDo66gPEhhW4TKWQqvSqo1G';
const REPO_OWNER = 'Faisalsathu786';
const REPO_NAME = 'Arc-Ecosystem-Radar';
const FILE_PATH = 'data/submitted-projects.json';
const BRANCH = 'main';

async function getSubmittedProjects(): Promise<any[]> {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
        Accept: 'application/vnd.github.v3+json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      console.error('GitHub fetch failed:', res.status);
      return [];
    }

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(content);
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
      logo: undefined,
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
