const { getFile, putFile } = require('./_github');

const PAGES_PATH = 'content/pages.json';

// Slugs that would collide with real paths already used by the site/deployment.
const RESERVED_SLUGS = new Set([
  'admin', 'api', 'blog', 'assets', 'content', 'skill-icons',
  'best-seo-expert-in-nepal', 'what-is-seo-and-how-does-it-work',
  'index', '404', 'favicon', 'robots', 'sitemap', 'rss', 'vercel', 'blog-media',
]);

async function loadAllPages() {
  try {
    const { content, sha } = await getFile(PAGES_PATH);
    return { pages: JSON.parse(content || '[]'), sha };
  } catch (err) {
    if (err.status === 404) return { pages: [], sha: null };
    throw err;
  }
}

async function saveAllPages(pages, sha, message) {
  const content = JSON.stringify(pages, null, 2) + '\n';
  const result = await putFile(PAGES_PATH, content, sha || undefined, message);
  return result.content.sha;
}

module.exports = { PAGES_PATH, RESERVED_SLUGS, loadAllPages, saveAllPages };
