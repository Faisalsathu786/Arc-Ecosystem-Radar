import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';

// Free JSON storage - no auth needed, no expiry if renewed daily
const JSONBLOB_ID = '019fa219-474f-7990-906c-c2d5199a89fc';
const JSONBLOB_URL = `https://jsonblob.com/api/jsonBlob/${JSONBLOB_ID}`;

interface SubmissionBody {
  name: string;
  handle?: string;
  description: string;
  category: string;
  twitter?: string;
  website?: string;
  status: string;
  tags: string[];
}

async function getExistingSubmitted(): Promise<any[]> {
  try {
    const res = await fetch(JSONBLOB_URL, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects || [];
  } catch (e) {
    console.error('Failed to fetch blob:', e);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body: SubmissionBody = await request.json();

    // Validate
    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Get existing submitted projects
    const existing = await getExistingSubmitted();

    // Deduplicate by name
    const existingNames = new Set(existing.map((p: any) => p.name.toLowerCase()));
    if (existingNames.has(body.name.toLowerCase())) {
      return NextResponse.json(
        { error: `Project "${body.name}" already exists in the directory` },
        { status: 409 }
      );
    }

    // Check against base projects too
    const baseNames = new Set(projects.map((p) => p.name.toLowerCase()));
    if (baseNames.has(body.name.toLowerCase())) {
      return NextResponse.json(
        { error: `Project "${body.name}" is already tracked in the base directory` },
        { status: 409 }
      );
    }

    // Create new project entry
    const newProject = {
      id: `submitted-${Date.now()}-${body.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: body.name,
      handle: body.handle || null,
      description: body.description,
      category: body.category,
      twitter: body.twitter || undefined,
      website: body.website || undefined,
      status: body.status || 'building',
      tags: body.tags || [],
      submitted: true,
      submittedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [...existing, newProject];

    // Save to jsonblob - no auth needed!
    const saveRes = await fetch(JSONBLOB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        id: 'arc-ecosystem-submissions',
        version: Date.now(),
        projects: updated,
      }),
    });

    if (!saveRes.ok) {
      throw new Error(`Failed to save: ${saveRes.status}`);
    }

    return NextResponse.json({
      success: true,
      project: {
        id: newProject.id,
        name: newProject.name,
        category: newProject.category,
        status: newProject.status,
      },
      message: 'Project submitted successfully! It is now live in the directory.',
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
