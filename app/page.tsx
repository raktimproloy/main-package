'use client';
import { useState } from 'react';
import Vercel from "@/component/vercel"

export default function UserInput() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setOutput('Running command...\n');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.output) {
                setOutput(prev => prev + data.output);
              } else if (data.error) {
                setOutput(prev => prev + `ERROR: ${data.error}`);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error:any) {
      setOutput(prev => prev + `\nError: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };


  const cloneRepo = async () => {
  try {
    const response = await fetch('/api/git-clone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/raktimproloy/rebuild-2.git',
        branch: 'main' // optional
      }),
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="flex flex-row space-x-2 mb-4">
        <input
          type="text"
          placeholder="Enter command (e.g., ping google.com)"
          className="px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleRun}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg transition duration-200 ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
      <pre className="bg-white text-black p-4 rounded-lg border w-full max-w-4xl h-96 overflow-y-auto whitespace-pre-wrap">
        {output || 'Output will appear here...'}
      </pre>
          <button onClick={() => cloneRepo()}>Clone</button>
      <Vercel/>
    </div>
  );
}