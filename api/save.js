const { isAuthenticated } = require('./_auth');
const { getFile, putFile } = require('./_github');
const { FIELDS, fieldsByFile } = require('./_manifest');
const { applyFields } = require('./_markers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CMS_SECRET;
  if (!secret || !isAuthenticated(req, secret)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const values = (req.body && req.body.values) || {};
  const knownIds = new Set(FIELDS.map((f) => f.id));
  const submitted = {};
  for (const [id, val] of Object.entries(values)) {
    if (knownIds.has(id) && typeof val === 'string') {
      submitted[id] = val;
    }
  }

  if (Object.keys(submitted).length === 0) {
    res.status(400).json({ error: 'No valid fields submitted.' });
    return;
  }

  try {
    const byFile = fieldsByFile();
    const updatedFiles = [];
    for (const [path, fields] of Object.entries(byFile)) {
      const relevantIds = fields.map((f) => f.id).filter((id) => id in submitted);
      if (relevantIds.length === 0) continue;

      const { content, sha } = await getFile(path);
      const fieldValues = {};
      for (const id of relevantIds) fieldValues[id] = submitted[id];
      const nextContent = applyFields(content, fieldValues);

      if (nextContent !== content) {
        await putFile(path, nextContent, sha, `Update content via CMS: ${relevantIds.join(', ')}`);
        updatedFiles.push(path);
      }
    }
    res.status(200).json({ ok: true, updatedFiles });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save content.' });
  }
};
