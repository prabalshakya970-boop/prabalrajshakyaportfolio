const { createSessionCookie, checkPassword } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CMS_SECRET;
  const adminPassword = process.env.CMS_ADMIN_PASSWORD;
  if (!secret || !adminPassword) {
    res.status(500).json({ error: 'CMS is not configured. Missing CMS_SECRET or CMS_ADMIN_PASSWORD.' });
    return;
  }

  const password = req.body && req.body.password;
  if (!checkPassword(password, adminPassword)) {
    res.status(401).json({ error: 'Incorrect password.' });
    return;
  }

  res.setHeader('Set-Cookie', createSessionCookie(secret));
  res.status(200).json({ ok: true });
};
