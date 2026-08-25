const { isAuthenticated } = require('../_auth');
const { loadAllPosts } = require('../_posts');

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
    const { posts } = await loadAllPosts();
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load posts.' });
  }
};
