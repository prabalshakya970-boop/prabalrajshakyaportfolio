const { getSha, putFile } = require('./_github');
const { loadAllPosts, savePublicIndex } = require('./_posts');
const { loadAllPages } = require('./_pages');
const { buildSitemap, buildRss } = require('./_seo-files');

// Sitemap needs BOTH posts and pages regardless of which one changed, so this
// always reloads both fresh rather than trusting a caller-supplied list.
async function regenerateDerivedFiles() {
  const { posts } = await loadAllPosts();
  const { pages } = await loadAllPages();

  await savePublicIndex(posts);

  const sitemapSha = await getSha('sitemap.xml');
  await putFile('sitemap.xml', buildSitemap(posts, pages), sitemapSha || undefined, 'Update sitemap.xml');

  const rssSha = await getSha('rss.xml');
  await putFile('rss.xml', buildRss(posts), rssSha || undefined, 'Update rss.xml');
}

module.exports = { regenerateDerivedFiles };
