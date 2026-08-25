const { isAuthenticated } = require('./_auth');
const { getFile } = require('./_github');
const { FIELDS, fieldsByFile } = require('./_manifest');
const { extractFields } = require('./_markers');
const { IMAGE_FIELDS, SITE_ORIGIN } = require('./_images');

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
    const rawFiles = {};
    for (const [path, fields] of Object.entries(byFile)) {
      const { content } = await getFile(path);
      rawFiles[path] = content;
      Object.assign(values, extractFields(content, fields));
    }
    const fields = FIELDS.map(({ id, label, type, page, group }) => ({ id, label, type, page, group }));
    const imageFields = IMAGE_FIELDS.map(({ id, label, group, path }) => ({
      id,
      label,
      group,
      url: `${SITE_ORIGIN}/${path}?t=${Date.now()}`,
    }));
    res.status(200).json({ values, fields, imageFields, siteOrigin: SITE_ORIGIN, rawFiles });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load content.' });
  }
};
