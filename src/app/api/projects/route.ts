import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let filtered = [...projects];

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
    totalAll: projects.length,
  });
}
