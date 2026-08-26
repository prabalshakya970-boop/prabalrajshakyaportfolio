// Images that can be replaced in place from the admin. Uploading a new file for
// one of these overwrites the exact same path in the repo, so no HTML changes
// are ever needed — every page referencing that path picks up the new image
// automatically. `path` is relative to the repo root.
const IMAGE_FIELDS = [
  { id: 'hero-photo', label: 'Hero Photo (homepage + SEO landing page)', path: 'prabal-profile.png', group: 'Images' },
  { id: 'article-cover', label: 'Article Cover — What Is SEO', path: 'blog/what-is-seo-and-how-does-it-work/cover.jpg', group: 'Images' },
  { id: 'trust-logo-globaly', label: 'Trust Logo — Globaly.io', path: 'assets/globaly_io_logo.jpg', group: 'Images — Trust Bar' },
  { id: 'trust-logo-orderlay', label: 'Trust Logo — Orderlay', path: 'assets/orderlay.png', group: 'Images — Trust Bar' },
  { id: 'trust-logo-danson', label: 'Trust Logo — Danson Solutions', path: 'assets/Danson_Solutions.png', group: 'Images — Trust Bar' },
  { id: 'trust-logo-chimpvine', label: 'Trust Logo — ChimpVine', path: 'assets/chimpvine.png', group: 'Images — Trust Bar' },
  { id: 'trust-logo-gsa', label: 'Trust Logo — GSA Contract Services', path: 'assets/gsa.jpg', group: 'Images — Trust Bar' },
  { id: 'trust-logo-smarttech', label: 'Trust Logo — Smart Tech Solutions', path: 'assets/smart-tech-solutions.jpg', group: 'Images — Trust Bar' },
];

const SITE_ORIGIN = 'https://www.prabalrajshakya.com.np';

function findImageField(id) {
  return IMAGE_FIELDS.find((f) => f.id === id);
}

module.exports = { IMAGE_FIELDS, SITE_ORIGIN, findImageField };
