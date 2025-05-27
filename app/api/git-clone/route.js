// app/api/git-clone/route.ts
import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { repoUrl, branch } = await request.json();

    // Validate input
    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Create a temporary directory in /tmp (writable in Vercel)
    const tempDir = path.join('/tmp', `clone-${Date.now()}`);
    fs.mkdirSync(tempDir);

    const git = simpleGit({
      baseDir: tempDir,
      maxConcurrentProcesses: 6,
      trimmed: false,
    });

    // Clone the repository
    await git.clone(repoUrl, tempDir, branch ? ['-b', branch] : []);

    // Get the list of files (or perform whatever operations you need)
    const files = fs.readdirSync(tempDir);

    // Clean up - delete the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      message: 'Repository cloned successfully',
      files: files.filter(f => !f.startsWith('.')), // filter out hidden files
    });
  } catch (error) {
    console.error('Git clone error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clone repository',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}