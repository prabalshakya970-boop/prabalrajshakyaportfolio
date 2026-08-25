const { isAuthenticated } = require('../_auth');
const { deleteFile, getSha } = require('../_github');
const { loadAllPosts, saveAllPosts } = require('../_posts');
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
    const { posts, sha } = await loadAllPosts();
    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx === -1) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    if (posts[idx].external) {
      res.status(400).json({ error: 'This post is not managed by the CMS and cannot be deleted here.' });
      return;
    }
    const [removed] = posts.splice(idx, 1);
    await saveAllPosts(posts, sha, `Delete post: ${removed.title}`);

    const pagePath = `blog/${slug}/index.html`;
    const pageSha = await getSha(pagePath);
    if (pageSha) await deleteFile(pagePath, pageSha, `Remove post page: ${removed.title}`);

    await regenerateDerivedFiles(posts);

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete post.' });
  }
};
