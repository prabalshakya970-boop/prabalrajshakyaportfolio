const { isAuthenticated } = require('../_auth');
const { getSha, putFile } = require('../_github');
const { slugify } = require('../_posts');

const MAX_BYTES = 4 * 1024 * 1024;
const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

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

  const { slug: rawSlug, dataUrl } = req.body || {};
  const slug = slugify(rawSlug || '');
  if (!slug) {
    res.status(400).json({ error: 'A valid post slug is required before uploading a cover image.' });
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
  const ext = EXT_BY_MIME[match[1]] || 'jpg';
  const base64Data = match[2];
  const approxBytes = Math.ceil((base64Data.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    res.status(400).json({ error: 'Image is too large. Please use a file under 4MB.' });
    return;
  }

  const path = `blog-media/${slug}/cover.${ext}`;
  try {
    const sha = await getSha(path);
    await putFile(path, base64Data, sha || undefined, `Upload cover image for post: ${slug}`, 'base64');
    res.status(200).json({ ok: true, path: `/${path}` });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to upload cover image.' });
  }
};
