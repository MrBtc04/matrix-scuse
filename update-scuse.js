// netlify/functions/update-scuse.js

import fetch from 'node-fetch'; // se usi Node 18+ puoi usare global fetch e togliere questa riga

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const {
    GITHUB_TOKEN,
    GITHUB_OWNER = 'MrBtc04',
    GITHUB_REPO,
    GITHUB_BRANCH = 'main',
    SCUSE_PATH = 'scuse.txt',
  } = process.env;

  if (!GITHUB_TOKEN) {
    return { statusCode: 500, body: 'Missing GITHUB_TOKEN env var' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  const content = body.content;
  if (typeof content !== 'string') {
    return { statusCode: 400, body: 'Missing "content" string' };
  }

  // 1) Prendo la versione corrente per ottenere lo SHA
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SCUSE_PATH}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'User-Agent': 'matrix-scuse-updater',
    Accept: 'application/vnd.github+json',
  };

  const currentRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, { headers });
  if (!currentRes.ok && currentRes.status !== 404) {
    const txt = await currentRes.text();
    return { statusCode: 500, body: `GitHub get error: ${currentRes.status} ${txt}` };
  }
  let sha = undefined;
  if (currentRes.ok) {
    const current = await currentRes.json();
    sha = current.sha;
  }

  // 2) Normalizzo e base64-izzo il file
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const b64 = Buffer.from(normalized, 'utf8').toString('base64');

  const payload = {
    message: 'Update scuse.txt via admin 2.0',
    content: b64,
    branch: GITHUB_BRANCH,
    sha, // se undefined, GitHub crea il file
  };

  const updateRes = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!updateRes.ok) {
    const txt = await updateRes.text();
    return { statusCode: 500, body: `GitHub update error: ${updateRes.status} ${txt}` };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
