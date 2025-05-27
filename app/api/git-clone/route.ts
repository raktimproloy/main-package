import { NextApiRequest, NextApiResponse } from 'next';
import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repoUrl, branch } = req.body;

  // Validate input
  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  try {
    // Create a temporary directory in /tmp (writable in Vercel)
    const tempDir = path.join('/tmp', `clone-${Date.now()}`);
    fs.mkdirSync(tempDir);

    const git: SimpleGit = simpleGit({
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

    return res.status(200).json({
      success: true,
      message: 'Repository cloned successfully',
      files: files.filter(f => !f.startsWith('.')), // filter out hidden files
    });
  } catch (error) {
    console.error('Git clone error:', error);
    return res.status(500).json({ 
      error: 'Failed to clone repository',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}