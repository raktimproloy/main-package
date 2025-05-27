import React from 'react'
import { Vercel } from '@vercel/sdk';

export default function index() {


const vercel = new Vercel({
  bearerToken: "Sc69BoTpQELGDUPpAvqI9Org",
});

async function createAndCheckDeployment() {
  try {
    // Create a new deployment
    const createResponse = await vercel.deployments.createDeployment({
      requestBody: {
        name: 'package-add', //The project name used in the deployment URL
        target: 'production',
        gitSource: {
          type: 'github',
          repo: 'package-add',
          ref: 'main',
          org: 'raktimproloy', //For a personal account, the org-name is your GH username
        },
      },
    });

    console.log(
      `Deployment created: ID ${createResponse.id} and status ${createResponse.status}`,
    );
  } catch (error) {
    console.error(
      error instanceof Error ? `Error: ${error.message}` : String(error),
    );
  }
}


  return (
    <button onClick={() => createAndCheckDeployment()}>Automation</button>
  )
}
