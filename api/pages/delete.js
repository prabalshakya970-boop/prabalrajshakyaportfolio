const { isAuthenticated } = require('../_auth');
const { deleteFile, getSha } = require('../_github');
const { loadAllPages, saveAllPages } = require('../_pages');
const { regenerateDerivedFiles } = require('../_regenerate');

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

  const { slug } = req.body || {};
  if (!slug) {
    res.status(400).json({ error: 'A slug is required.' });
    return;
  }

  try {
    const { pages, sha } = await loadAllPages();
    const idx = pages.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      res.status(404).json({ error: 'Page not found.' });
      return;
    }
    const [removed] = pages.splice(idx, 1);
    await saveAllPages(pages, sha, `Delete page: ${removed.title}`);

    const pagePath = `${slug}/index.html`;
    const pageSha = await getSha(pagePath);
    if (pageSha) await deleteFile(pagePath, pageSha, `Remove page: ${removed.title}`);

    await regenerateDerivedFiles();

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete page.' });
  }
};
