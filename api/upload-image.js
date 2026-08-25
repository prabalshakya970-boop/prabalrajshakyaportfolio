const { isAuthenticated } = require('./_auth');
const { getSha, putFile } = require('./_github');
const { findImageField } = require('./_images');

const MAX_BYTES = 4 * 1024 * 1024;

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

  const { id, dataUrl } = req.body || {};
  const field = findImageField(id);
  if (!field) {
    res.status(400).json({ error: 'Unknown image field.' });
    return;
  }
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    res.status(400).json({ error: 'No image data received.' });
    return;
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: 'Invalid image data.' });
    return;
  }
  const base64Data = match[2];
  const approxBytes = Math.ceil((base64Data.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    res.status(400).json({ error: 'Image is too large. Please use a file under 4MB.' });
    return;
  }

  try {
    const sha = await getSha(field.path);
    await putFile(field.path, base64Data, sha, `Update image via CMS: ${field.label}`, 'base64');
    res.status(200).json({ ok: true, path: field.path });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to upload image.' });
  }
};
