// Consolidated into one file (instead of one file per operation) to stay under
// Vercel Hobby's 12-serverless-function-per-deployment limit. Routed by
// ?op=list|save|delete|upload-hero (GET for list, POST for the rest).
const { isAuthenticated } = require('./_auth');
const { putFile, deleteFile, getSha } = require('./_github');
const { slugify } = require('./_posts');
const { loadAllPages, saveAllPages, RESERVED_SLUGS } = require('./_pages');
const { renderStandalonePage } = require('./_page-template');
const { regenerateDerivedFiles } = require('./_regenerate');

async function handleList(req, res) {
  const { pages } = await loadAllPages();
  res.status(200).json({ pages });
}

async function handleSave(req, res) {
  const { page, action, originalSlug } = req.body || {};
  if (!page || typeof page.title !== 'string' || !page.title.trim()) {
    res.status(400).json({ error: 'A title is required.' });
    return;
  }
  if (action !== 'draft' && action !== 'publish') {
    res.status(400).json({ error: 'Invalid action.' });
    return;
  }

  const slug = slugify(page.slug || page.title);
  if (!slug) {
    res.status(400).json({ error: 'Could not derive a valid URL slug from the title.' });
    return;
  }
  if (RESERVED_SLUGS.has(slug)) {
    res.status(400).json({ error: `"${slug}" is a reserved URL and can't be used for a page.` });
    return;
  }

  const { pages, sha } = await loadAllPages();
  const isUpdate = !!originalSlug;
  const existingIndex = isUpdate ? pages.findIndex((p) => p.slug === originalSlug) : -1;

  if (isUpdate && existingIndex === -1) {
    res.status(404).json({ error: 'Page not found.' });
    return;
  }
  if (isUpdate && pages[existingIndex].external) {
    res.status(400).json({ error: 'This page is not managed by the CMS and cannot be edited here.' });
    return;
  }
  if (!isUpdate && pages.some((p) => p.slug === slug)) {
    res.status(400).json({ error: 'A page with this URL slug already exists.' });
    return;
  }
  if (isUpdate && slug !== originalSlug) {
    res.status(400).json({ error: 'The URL slug cannot be changed after a page is first saved.' });
    return;
  }

  const now = new Date().toISOString();
  const existing = existingIndex !== -1 ? pages[existingIndex] : null;
  const status = action === 'publish' ? 'published' : 'draft';

  const nextPage = {
    slug,
    title: page.title.trim(),
    metaTitle: page.metaTitle || page.title.trim(),
    metaDescription: page.metaDescription || '',
    eyebrow: page.eyebrow || '',
    lead: page.lead || '',
    heroImage: page.heroImage || (existing && existing.heroImage) || '',
    body: page.body || '',
    ctaHeading: page.ctaHeading || '',
    ctaSubtext: page.ctaSubtext || '',
    status,
    createdAt: (existing && existing.createdAt) || now,
    updatedAt: now,
  };

  if (existingIndex !== -1) {
    pages[existingIndex] = nextPage;
  } else {
    pages.push(nextPage);
  }

  await saveAllPages(pages, sha, `${isUpdate ? 'Update' : 'Create'} page: ${nextPage.title}`);

  if (status === 'published') {
    const pagePath = `${slug}/index.html`;
    const pageSha = await getSha(pagePath);
    await putFile(pagePath, renderStandalonePage(nextPage), pageSha || undefined, `Publish page: ${nextPage.title}`);
  }

  await regenerateDerivedFiles();

  res.status(200).json({ ok: true, page: nextPage });
}

async function handleDelete(req, res) {
  const { slug } = req.body || {};
  if (!slug) {
    res.status(400).json({ error: 'A slug is required.' });
    return;
  }
  const { pages, sha } = await loadAllPages();
  const idx = pages.findIndex((p) => p.slug === slug);
  if (idx === -1) {
    res.status(404).json({ error: 'Page not found.' });
    return;
  }
  if (pages[idx].external) {
    res.status(400).json({ error: 'This page is not managed by the CMS and cannot be deleted here.' });
    return;
  }
  const [removed] = pages.splice(idx, 1);
  await saveAllPages(pages, sha, `Delete page: ${removed.title}`);

  const pagePath = `${slug}/index.html`;
  const pageSha = await getSha(pagePath);
  if (pageSha) await deleteFile(pagePath, pageSha, `Remove page: ${removed.title}`);

  await regenerateDerivedFiles();

  res.status(200).json({ ok: true });
}

async function handleUploadHero(req, res) {
  const MAX_BYTES = 4 * 1024 * 1024;
  const EXT_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

  const { slug: rawSlug, dataUrl } = req.body || {};
  const slug = slugify(rawSlug || '');
  if (!slug) {
    res.status(400).json({ error: 'A valid page slug is required before uploading a hero image.' });
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

  const path = `page-media/${slug}/hero.${ext}`;
  const sha = await getSha(path);
  await putFile(path, base64Data, sha || undefined, `Upload hero image for page: ${slug}`, 'base64');
  res.status(200).json({ ok: true, path: `/${path}` });
}

module.exports = async (req, res) => {
  const secret = process.env.CMS_SECRET;
  if (!secret || !isAuthenticated(req, secret)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const op = (req.query && req.query.op) || (req.method === 'GET' ? 'list' : null);

  try {
    if (req.method === 'GET' && op === 'list') return await handleList(req, res);
    if (req.method === 'POST' && op === 'save') return await handleSave(req, res);
    if (req.method === 'POST' && op === 'delete') return await handleDelete(req, res);
    if (req.method === 'POST' && op === 'upload-hero') return await handleUploadHero(req, res);
    res.status(400).json({ error: 'Unknown operation.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Request failed.' });
  }
};
