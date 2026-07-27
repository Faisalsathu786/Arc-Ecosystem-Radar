import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';

const GITHUB_PAT = process.env.GITHUB_PAT;
const REPO_OWNER = 'Faisalsathu786';
const REPO_NAME = 'Arc-Ecosystem-Radar';
const FILE_PATH = 'data/submitted-projects.json';
const BRANCH = 'main';

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
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_PAT}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return JSON.parse(content);
}

export async function POST(request: Request) {
  try {
    const body: SubmissionBody = await request.json();

    // Check PAT is configured
    if (!GITHUB_PAT) {
      return NextResponse.json(
        { error: 'GitHub token not configured. Ask the dashboard owner to set GITHUB_PAT in Vercel environment variables.' },
        { status: 500 }
      );
    }

    // Validate
    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Get existing submitted projects from GitHub
    const existing = await getExistingSubmitted();

    // Deduplicate by name (case-insensitive)
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
    const encodedContent = Buffer.from(JSON.stringify(updated, null, 2)).toString('base64');

    // Commit to GitHub
    const commitUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

    // First get the SHA if file exists
    let sha: string | null = null;
    try {
      const existingFile = await fetch(
        `${commitUrl}?ref=${BRANCH}`,
        {
          headers: {
            Authorization: `token ${GITHUB_PAT}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (existingFile.ok) {
        const fileData = await existingFile.json();
        sha = fileData.sha;
      }
    } catch {}

    const commitBody: any = {
      message: `Submit project: ${body.name} [skip ci]`,
      content: encodedContent,
      branch: BRANCH,
    };

    if (sha) {
      commitBody.sha = sha;
    }

    const commitRes = await fetch(commitUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commitBody),
    });

    if (!commitRes.ok) {
      const errText = await commitRes.text();
      throw new Error(`GitHub commit failed (${commitRes.status}): ${errText}`);
    }

    return NextResponse.json({
      success: true,
      project: {
        id: newProject.id,
        name: newProject.name,
        category: newProject.category,
        status: newProject.status,
      },
      message: 'Project submitted. It is now live in the directory!',
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
