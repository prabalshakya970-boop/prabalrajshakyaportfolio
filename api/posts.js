// Consolidated into one file (instead of one file per operation) to stay under
// Vercel Hobby's 12-serverless-function-per-deployment limit. Routed by
// ?op=list|save|delete|bulk|upload-cover (GET for list, POST for the rest).
const { isAuthenticated } = require('./_auth');
const { putFile, deleteFile, getSha } = require('./_github');
const { loadAllPosts, saveAllPosts, slugify, estimateReadTime } = require('./_posts');
const { renderPostPage } = require('./_post-template');
const { regenerateDerivedFiles } = require('./_regenerate');

async function handleList(req, res) {
  const { posts } = await loadAllPosts();
  res.status(200).json({ posts });
}

async function handleSave(req, res) {
  const VALID_ACTIONS = ['draft', 'publish', 'schedule'];
  const { post, action, originalSlug, scheduledDate } = req.body || {};
  if (!post || typeof post.title !== 'string' || !post.title.trim()) {
    res.status(400).json({ error: 'A title is required.' });
    return;
  }
  if (!VALID_ACTIONS.includes(action)) {
    res.status(400).json({ error: 'Invalid action.' });
    return;
  }
  if (action === 'schedule' && !scheduledDate) {
    res.status(400).json({ error: 'A scheduled date is required.' });
    return;
  }

  const slug = slugify(post.slug || post.title);
  if (!slug) {
    res.status(400).json({ error: 'Could not derive a valid URL slug from the title.' });
    return;
  }

  const { posts, sha } = await loadAllPosts();
  const isUpdate = !!originalSlug;
  const existingIndex = isUpdate ? posts.findIndex((p) => p.slug === originalSlug) : -1;

  if (isUpdate && existingIndex === -1) {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }
  if (!isUpdate && posts.some((p) => p.slug === slug)) {
    res.status(400).json({ error: 'A post with this URL slug already exists.' });
    return;
  }
  if (isUpdate && slug !== originalSlug) {
    res.status(400).json({ error: 'The URL slug cannot be changed after a post is first saved.' });
    return;
  }

  const now = new Date().toISOString();
  const existing = existingIndex !== -1 ? posts[existingIndex] : null;
  const status = action === 'publish' ? 'published' : action === 'schedule' ? 'scheduled' : 'draft';

  const nextPost = {
    slug,
    title: post.title.trim(),
    metaTitle: post.metaTitle || post.title.trim(),
    metaDescription: post.metaDescription || post.excerpt || '',
    excerpt: post.excerpt || '',
    coverImage: post.coverImage || (existing && existing.coverImage) || '',
    category: post.category || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    author: post.author || 'Prabal Raj Shakya',
    body: post.body || '',
    readTime: post.readTime || estimateReadTime(post.body),
    status,
    publishDate: status === 'published' ? (existing && existing.publishDate) || now : (existing && existing.publishDate) || null,
    scheduledDate: status === 'scheduled' ? scheduledDate : null,
    url: `/blog/${slug}/`,
    createdAt: (existing && existing.createdAt) || now,
    updatedAt: now,
  };

  if (existingIndex !== -1) {
    posts[existingIndex] = nextPost;
  } else {
    posts.push(nextPost);
  }

  const newSha = await saveAllPosts(posts, sha, `${isUpdate ? 'Update' : 'Create'} post: ${nextPost.title}`);

  if (status === 'published') {
    const pagePath = `blog/${slug}/index.html`;
    const pageSha = await getSha(pagePath);
    await putFile(pagePath, renderPostPage(nextPost), pageSha || undefined, `Publish post page: ${nextPost.title}`);
  }

  await regenerateDerivedFiles();

  res.status(200).json({ ok: true, post: nextPost, sha: newSha });
}

async function handleDelete(req, res) {
  const { slug } = req.body || {};
  if (!slug) {
    res.status(400).json({ error: 'A slug is required.' });
    return;
  }
  const { posts, sha } = await loadAllPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }
  if (posts[idx].external) {
    res.status(400).json({ error: 'This post is not managed by the CMS and cannot be deleted here.' });
    return;
  }
  const [removed] = posts.splice(idx, 1);
  await saveAllPosts(posts, sha, `Delete post: ${removed.title}`);

  const pagePath = `blog/${slug}/index.html`;
  const pageSha = await getSha(pagePath);
  if (pageSha) await deleteFile(pagePath, pageSha, `Remove post page: ${removed.title}`);

  await regenerateDerivedFiles();

  res.status(200).json({ ok: true });
}

async function handleBulk(req, res) {
  const VALID_ACTIONS = ['publish', 'unpublish', 'delete'];
  const { slugs, action } = req.body || {};
  if (!Array.isArray(slugs) || slugs.length === 0) {
    res.status(400).json({ error: 'No posts selected.' });
    return;
  }
  if (!VALID_ACTIONS.includes(action)) {
    res.status(400).json({ error: 'Invalid bulk action.' });
    return;
  }

  const { posts, sha } = await loadAllPosts();
  const now = new Date().toISOString();
  const affected = [];
  const targetable = posts.filter((p) => slugs.includes(p.slug) && !p.external);

  if (action === 'delete') {
    const remaining = posts.filter((p) => !targetable.includes(p));
    const removed = targetable;
    await saveAllPosts(remaining, sha, `Bulk delete ${removed.length} post(s)`);
    for (const p of removed) {
      const pagePath = `blog/${p.slug}/index.html`;
      const pageSha = await getSha(pagePath);
      if (pageSha) await deleteFile(pagePath, pageSha, `Remove post page: ${p.title}`);
    }
    await regenerateDerivedFiles();
    res.status(200).json({ ok: true, affected: removed.length });
    return;
  }

  for (const p of posts) {
    if (!slugs.includes(p.slug) || p.external) continue;
    if (action === 'publish') {
      p.status = 'published';
      p.publishDate = p.publishDate || now;
      p.scheduledDate = null;
    } else if (action === 'unpublish') {
      p.status = 'draft';
    }
    p.updatedAt = now;
    affected.push(p);
  }

  await saveAllPosts(posts, sha, `Bulk ${action} ${affected.length} post(s)`);

  if (action === 'publish') {
    for (const p of affected) {
      const pagePath = `blog/${p.slug}/index.html`;
      const pageSha = await getSha(pagePath);
      await putFile(pagePath, renderPostPage(p), pageSha || undefined, `Publish post page: ${p.title}`);
    }
  }

  await regenerateDerivedFiles();

  res.status(200).json({ ok: true, affected: affected.length });
}

async function handleUploadCover(req, res) {
  const MAX_BYTES = 4 * 1024 * 1024;
  const EXT_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

  const { slug: rawSlug, dataUrl } = req.body || {};
  const slug = slugify(rawSlug || '');
  if (!slug) {
    res.status(400).json({ error: 'A valid post slug is required before uploading a cover image.' });
    return;
  }
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    res.status(400).json({ error: 'No image data received.' });
    return;
  }
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: 'Invalid image data.' });
    return;
  }
  const ext = EXT_BY_MIME[match[1]] || 'jpg';
  const base64Data = match[2];
  const approxBytes = Math.ceil((base64Data.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    res.status(400).json({ error: 'Image is too large. Please use a file under 4MB.' });
    return;
  }

  const path = `blog-media/${slug}/cover.${ext}`;
  const sha = await getSha(path);
  await putFile(path, base64Data, sha || undefined, `Upload cover image for post: ${slug}`, 'base64');
  res.status(200).json({ ok: true, path: `/${path}` });
}

module.exports = async (req, res) => {
  const secret = process.env.CMS_SECRET;
  if (!secret || !isAuthenticated(req, secret)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const op = (req.query && req.query.op) || (req.method === 'GET' ? 'list' : null);

  try {
    if (req.method === 'GET' && op === 'list') return await handleList(req, res);
    if (req.method === 'POST' && op === 'save') return await handleSave(req, res);
    if (req.method === 'POST' && op === 'delete') return await handleDelete(req, res);
    if (req.method === 'POST' && op === 'bulk') return await handleBulk(req, res);
    if (req.method === 'POST' && op === 'upload-cover') return await handleUploadCover(req, res);
    res.status(400).json({ error: 'Unknown operation.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Request failed.' });
  }
};
