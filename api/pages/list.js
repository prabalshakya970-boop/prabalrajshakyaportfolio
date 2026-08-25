const { isAuthenticated } = require('../_auth');
const { loadAllPages } = require('../_pages');

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
    const { pages } = await loadAllPages();
    res.status(200).json({ pages });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load pages.' });
  }
};
