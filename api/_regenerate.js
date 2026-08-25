const { getSha, putFile } = require('./_github');
const { savePublicIndex } = require('./_posts');
const { buildSitemap, buildRss } = require('./_seo-files');

async function regenerateDerivedFiles(posts) {
  await savePublicIndex(posts);

  const sitemapSha = await getSha('sitemap.xml');
  await putFile('sitemap.xml', buildSitemap(posts), sitemapSha || undefined, 'Update sitemap.xml');

  const rssSha = await getSha('rss.xml');
  await putFile('rss.xml', buildRss(posts), rssSha || undefined, 'Update rss.xml');
}

module.exports = { regenerateDerivedFiles };
