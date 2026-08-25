const { isAuthenticated } = require('../_auth');
const { putFile, getSha } = require('../_github');
const { slugify } = require('../_posts');
const { loadAllPages, saveAllPages, RESERVED_SLUGS } = require('../_pages');
const { renderStandalonePage } = require('../_page-template');
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

  try {
    const { pages, sha } = await loadAllPages();
    const isUpdate = !!originalSlug;
    const existingIndex = isUpdate ? pages.findIndex((p) => p.slug === originalSlug) : -1;

    if (isUpdate && existingIndex === -1) {
      res.status(404).json({ error: 'Page not found.' });
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
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save page.' });
  }
};
