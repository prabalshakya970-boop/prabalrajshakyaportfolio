const { putFile, getSha } = require('../_github');
const { loadAllPosts, saveAllPosts } = require('../_posts');
const { renderPostPage } = require('../_post-template');
const { regenerateDerivedFiles } = require('../_regenerate');

module.exports = async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
  }

  try {
    const { posts, sha } = await loadAllPosts();
    const now = new Date();
    const due = posts.filter((p) => p.status === 'scheduled' && p.scheduledDate && new Date(p.scheduledDate) <= now);

    if (due.length === 0) {
      res.status(200).json({ ok: true, published: 0 });
      return;
    }

    due.forEach((p) => {
      p.status = 'published';
      p.publishDate = p.publishDate || now.toISOString();
      p.scheduledDate = null;
      p.updatedAt = now.toISOString();
    });

    await saveAllPosts(posts, sha, `Auto-publish ${due.length} scheduled post(s)`);

    for (const p of due) {
      const pagePath = `blog/${p.slug}/index.html`;
      const pageSha = await getSha(pagePath);
      await putFile(pagePath, renderPostPage(p), pageSha || undefined, `Publish post page: ${p.title}`);
    }

    await regenerateDerivedFiles(posts);

    res.status(200).json({ ok: true, published: due.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to publish scheduled posts.' });
  }
};
