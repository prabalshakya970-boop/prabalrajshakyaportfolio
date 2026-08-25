function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) {
    throw new Error('Missing GITHUB_TOKEN or GITHUB_REPO environment variable.');
  }
  const [owner, name] = repo.split('/');
  return { token, owner, name, branch };
}

async function getFile(path) {
  const { token, owner, name, branch } = config();
  const url = `https://api.github.com/repos/${owner}/${name}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (res.status === 404) {
    const err = new Error(`GitHub GET ${path} failed: 404 Not Found`);
    err.status = 404;
    throw err;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`GitHub GET ${path} failed: ${res.status} ${body}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { content, sha: data.sha };
}

async function putFile(path, content, sha, message, encoding) {
  const { token, owner, name, branch } = config();
  const url = `https://api.github.com/repos/${owner}/${name}/contents/${encodeURI(path)}`;
  const base64Content = encoding === 'base64' ? content : Buffer.from(content, 'utf8').toString('base64');
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: base64Content,
      sha,
      branch,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`GitHub PUT ${path} failed: ${res.status} ${body}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function deleteFile(path, sha, message) {
  const { token, owner, name, branch } = config();
  const url = `https://api.github.com/repos/${owner}/${name}/contents/${encodeURI(path)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sha, branch }),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`GitHub DELETE ${path} failed: ${res.status} ${body}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function getSha(path) {
  const { token, owner, name, branch } = config();
  const url = `https://api.github.com/repos/${owner}/${name}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`GitHub GET ${path} failed: ${res.status} ${body}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.sha;
}

module.exports = { getFile, putFile, deleteFile, getSha };
