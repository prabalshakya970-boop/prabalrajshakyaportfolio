const { isAuthenticated } = require('./_auth');
const { getFile } = require('./_github');
const { FIELDS, fieldsByFile } = require('./_manifest');
const { extractFields } = require('./_markers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CMS_SECRET;
  if (!secret || !isAuthenticated(req, secret)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const byFile = fieldsByFile();
    const values = {};
    for (const [path, fields] of Object.entries(byFile)) {
      const { content } = await getFile(path);
      Object.assign(values, extractFields(content, fields));
    }
    const fields = FIELDS.map(({ id, label, type, group }) => ({ id, label, type, group }));
    res.status(200).json({ values, fields });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load content.' });
  }
};
