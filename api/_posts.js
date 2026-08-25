const { getFile, putFile } = require('./_github');

const POSTS_PATH = 'content/posts.json';
const INDEX_PATH = 'content/posts-index.json';
const SITE_ORIGIN = 'https://www.prabalrajshakya.com.np';

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function estimateReadTime(html) {
  const text = String(html || '').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return minutes + ' min read';
}

async function loadAllPosts() {
  try {
    const { content, sha } = await getFile(POSTS_PATH);
    return { posts: JSON.parse(content || '[]'), sha };
  } catch (err) {
    if (err.status === 404) return { posts: [], sha: null };
    throw err;
  }
}

async function saveAllPosts(posts, sha, message) {
  const content = JSON.stringify(posts, null, 2) + '\n';
  const result = await putFile(POSTS_PATH, content, sha || undefined, message);
  return result.content.sha;
}

function buildPublicIndex(posts) {
  return posts
    .filter((p) => p.status === 'published')
    .slice()
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      category: p.category,
      tags: p.tags || [],
      author: p.author,
      publishDate: p.publishDate,
      readTime: p.readTime,
      url: p.url || `/blog/${p.slug}/`,
    }));
}

async function savePublicIndex(posts) {
  let sha = null;
  try {
    const existing = await getFile(INDEX_PATH);
    sha = existing.sha;
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  const content = JSON.stringify(buildPublicIndex(posts), null, 2) + '\n';
  await putFile(INDEX_PATH, content, sha || undefined, 'Update posts-index.json');
}

module.exports = {
  POSTS_PATH,
  INDEX_PATH,
  SITE_ORIGIN,
  slugify,
  estimateReadTime,
  loadAllPosts,
  saveAllPosts,
  buildPublicIndex,
  savePublicIndex,
};
