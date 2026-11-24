const { putFile, getSha } = require('./_github');
const { renderPostPage } = require('./_post-template');
const { dependentsOf } = require('./_links');

// Re-render the static pages of already-published posts that mention any of the
// slugs whose published state just changed (published or unpublished), so their
// internal links match what is live at this moment.
async function rerenderDependents(changedSlugs, posts, skipSlugs) {
  const skip = new Set(skipSlugs || []);
  const targets = dependentsOf(changedSlugs, posts).filter((p) => !skip.has(p.slug));
  for (const p of targets) {
    const pagePath = `blog/${p.slug}/index.html`;
    const pageSha = await getSha(pagePath);
    await putFile(pagePath, renderPostPage(p, posts), pageSha || undefined, `Update internal links: ${p.title}`);
  }
  return targets.length;
}

module.exports = { rerenderDependents };
