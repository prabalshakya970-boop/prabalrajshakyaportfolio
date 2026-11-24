// Sequenced internal linking.
//
// A post body may contain markers of the form {{link:target-slug|anchor text}}.
// At render time a marker becomes a real <a> ONLY if the target post is
// published. Otherwise only the anchor text is kept, so a page never links to
// a post that is still scheduled or in draft. When the target is published
// later, the pages that mention it are re-rendered (see _relink.js) and the
// link appears.
const MARKER = /\{\{link:([a-z0-9-]+)\|([^}]+)\}\}/g;

function publishedSlugs(posts) {
  return new Set((posts || []).filter((p) => p.status === 'published').map((p) => p.slug));
}

function resolveLinks(body, posts) {
  const live = publishedSlugs(posts);
  return String(body || '').replace(MARKER, (_m, slug, anchor) =>
    live.has(slug) ? `<a href="/blog/${slug}/">${anchor}</a>` : anchor
  );
}

function linkedSlugs(body) {
  const out = [];
  String(body || '').replace(MARKER, (_m, slug) => { out.push(slug); return _m; });
  return out;
}

// Published, CMS-managed posts whose body mentions any of the given slugs.
function dependentsOf(slugs, posts) {
  const wanted = new Set(slugs);
  return (posts || []).filter(
    (p) => p.status === 'published' && !p.external && linkedSlugs(p.body).some((s) => wanted.has(s))
  );
}

module.exports = { resolveLinks, linkedSlugs, dependentsOf };
