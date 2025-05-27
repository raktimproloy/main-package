export const dynamic = 'force-dynamic';

import { exec } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { command } = await request.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Invalid command input' },
        { status: 400 }
      );
    }

    // Create a stream for real-time output
    const stream = new ReadableStream({
      async start(controller) {
        const process = exec(command);
        
        process.stdout.on('data', (data) => {
          controller.enqueue(`data: ${JSON.stringify({ output: data })}\n\n`);
        });

        process.stderr.on('data', (data) => {
          controller.enqueue(`data: ${JSON.stringify({ error: data })}\n\n`);
        });

        process.on('close', () => {
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}