const { isAuthenticated } = require('../_auth');
const { putFile, deleteFile, getSha } = require('../_github');
const { loadAllPosts, saveAllPosts } = require('../_posts');
const { renderPostPage } = require('../_post-template');
const { regenerateDerivedFiles } = require('../_regenerate');

const VALID_ACTIONS = ['publish', 'unpublish', 'delete'];

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

  const { slugs, action } = req.body || {};
  if (!Array.isArray(slugs) || slugs.length === 0) {
    res.status(400).json({ error: 'No posts selected.' });
    return;
  }
  if (!VALID_ACTIONS.includes(action)) {
    res.status(400).json({ error: 'Invalid bulk action.' });
    return;
  }

  try {
    const { posts, sha } = await loadAllPosts();
    const now = new Date().toISOString();
    const affected = [];

    const targetable = posts.filter((p) => slugs.includes(p.slug) && !p.external);

    if (action === 'delete') {
      const remaining = posts.filter((p) => !targetable.includes(p));
      const removed = targetable;
      await saveAllPosts(remaining, sha, `Bulk delete ${removed.length} post(s)`);
      for (const p of removed) {
        const pagePath = `blog/${p.slug}/index.html`;
        const pageSha = await getSha(pagePath);
        if (pageSha) await deleteFile(pagePath, pageSha, `Remove post page: ${p.title}`);
      }
      await regenerateDerivedFiles();
      res.status(200).json({ ok: true, affected: removed.length });
      return;
    }

    for (const p of posts) {
      if (!slugs.includes(p.slug) || p.external) continue;
      if (action === 'publish') {
        p.status = 'published';
        p.publishDate = p.publishDate || now;
        p.scheduledDate = null;
      } else if (action === 'unpublish') {
        p.status = 'draft';
      }
      p.updatedAt = now;
      affected.push(p);
    }

    await saveAllPosts(posts, sha, `Bulk ${action} ${affected.length} post(s)`);

    if (action === 'publish') {
      for (const p of affected) {
        const pagePath = `blog/${p.slug}/index.html`;
        const pageSha = await getSha(pagePath);
        await putFile(pagePath, renderPostPage(p), pageSha || undefined, `Publish post page: ${p.title}`);
      }
    }

    await regenerateDerivedFiles();

    res.status(200).json({ ok: true, affected: affected.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to run bulk action.' });
  }
};
