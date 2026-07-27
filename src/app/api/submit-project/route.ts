import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // Read existing submitted projects
    const filePath = path.join(process.cwd(), 'data', 'submitted-projects.json');
    let submitted: any[] = [];
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      submitted = JSON.parse(content);
    } catch {
      submitted = [];
    }

    // Create new project entry
    const newProject = {
      id: `submitted-${Date.now()}`,
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

    submitted.push(newProject);

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(submitted, null, 2));

    return NextResponse.json({
      success: true,
      project: newProject,
      message: 'Project submitted successfully. It will appear in the directory after review.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit project: ' + String(error) },
      { status: 500 }
    );
  }
}
