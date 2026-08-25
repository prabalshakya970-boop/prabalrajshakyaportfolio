const { isAuthenticated } = require('../_auth');
const { putFile, getSha } = require('../_github');
const { loadAllPosts, saveAllPosts, slugify, estimateReadTime } = require('../_posts');
const { renderPostPage } = require('../_post-template');
const { regenerateDerivedFiles } = require('../_regenerate');

const VALID_ACTIONS = ['draft', 'publish', 'schedule'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const secret = process.env.CMS_SECRET;
  if (!secret || !isAuthenticated(req, secret)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

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

  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save post.' });
  }
};
