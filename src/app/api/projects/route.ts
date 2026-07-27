import { NextResponse } from 'next/server';
import { projects, activityFeed as baseActivity } from '@/data/projects';
import fs from 'fs';
import path from 'path';

interface SubmittedProject {
  id: string;
  name: string;
  handle: string | null;
  description: string;
  category: string;
  twitter?: string;
  website?: string;
  status: string;
  tags: string[];
  submitted: boolean;
  submittedAt?: string;
}

function getSubmittedProjects(): SubmittedProject[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'submitted-projects.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const submitted = getSubmittedProjects();

  // Merge base projects + submitted projects, deduplicate by id
  const baseIds = new Set(projects.map((p) => p.id));
  const uniqueSubmitted = submitted.filter((p) => !baseIds.has(p.id));

  const merged = [
    ...projects,
    ...uniqueSubmitted.map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      description: p.description,
      category: p.category as any,
      twitter: p.twitter,
      website: p.website,
      status: p.status as any,
      tags: p.tags,
      spotlight: false,
      logo: undefined,
      submitted: true as const,
      submittedAt: p.submittedAt,
    })),
  ];

  let filtered = [...merged];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
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
