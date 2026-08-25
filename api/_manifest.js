// Every editable field on the site. `id` must match the marker id used in the
// HTML comments (<!--cms:id-->...<!--cms:/id--> or <!--cms-attr:id:attr:transform-->).
// `page` groups fields into the admin's page navigation; `group` is the sub-section within a page.
// type is a UI hint: text = single line, textarea = multi line, richtext = Bold/Italic box,
// richtext-full = Bold/Italic/Headings/Lists box, repeater-steps/repeater-faq/repeater-cards/
// repeater-checklist = add/remove card lists.
const FIELDS = [
  { id: 'meta-title', label: 'Page Title (SEO)', type: 'text', file: 'index.html', page: 'Homepage', group: 'SEO' },
  { id: 'meta-description', label: 'Meta Description (SEO)', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'SEO' },

  { id: 'hero-h1', label: 'Hero Headline', type: 'text', file: 'index.html', page: 'Homepage', group: 'Hero' },
  { id: 'hero-lead', label: 'Hero Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Hero' },

  { id: 'trust-heading', label: 'Section Heading', type: 'text', file: 'index.html', page: 'Homepage', group: 'Trusted By' },
  { id: 'trust-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Trusted By' },

  { id: 'about-heading', label: 'Section Heading', type: 'text', file: 'index.html', page: 'Homepage', group: 'About' },
  { id: 'about-body', label: 'Body', type: 'richtext', file: 'index.html', page: 'Homepage', group: 'About' },

  { id: 'engage-heading', label: 'Section Heading', type: 'text', file: 'index.html', page: 'Homepage', group: 'Video Portfolio' },
  { id: 'engage-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Video Portfolio' },

  { id: 'process-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Process' },
  { id: 'process-steps', label: 'Steps', type: 'repeater-steps', file: 'index.html', page: 'Homepage', group: 'Process' },

  { id: 'skills-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Skills' },
  { id: 'tools-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Tools' },
  { id: 'insights-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Insights' },

  { id: 'faq-list', label: 'FAQ Items', type: 'repeater-faq', file: 'index.html', page: 'Homepage', group: 'FAQ' },

  { id: 'contact-cta-heading', label: 'Banner Heading', type: 'text', file: 'index.html', page: 'Homepage', group: 'Contact' },
  { id: 'contact-cta-subtext', label: 'Banner Subtext', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Contact' },
  { id: 'contact-lead', label: 'Section Intro', type: 'textarea', file: 'index.html', page: 'Homepage', group: 'Contact' },
  { id: 'contact-email', label: 'Contact Email (updates every place it appears, including the footer)', type: 'text', file: 'index.html', page: 'Homepage', group: 'Contact' },
  { id: 'contact-phone', label: 'Contact Phone — format: +977 9848853606 (updates tel:, WhatsApp and display text)', type: 'text', file: 'index.html', page: 'Homepage', group: 'Contact' },

  { id: 'footer-heading', label: 'Footer Heading', type: 'text', file: 'index.html', page: 'Homepage', group: 'Footer' },

  { id: 'seo-meta-title', label: 'Page Title (SEO)', type: 'text', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'SEO' },
  { id: 'seo-meta-description', label: 'Meta Description (SEO)', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'SEO' },
  { id: 'seo-hero-h1', label: 'Hero Headline', type: 'text', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Hero' },
  { id: 'seo-hero-lead', label: 'Hero Subtext', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Hero' },

  { id: 'seo-whyme-heading', label: 'Section Heading', type: 'text', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Why Me' },
  { id: 'seo-whyme-subtext', label: 'Section Subtext', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Why Me' },
  { id: 'seo-whyme-cards', label: 'Cards', type: 'repeater-cards', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Why Me' },

  { id: 'seo-services-heading', label: 'Section Heading', type: 'text', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Services' },
  { id: 'seo-services-cards', label: 'Cards', type: 'repeater-cards', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Services' },

  { id: 'seo-skillreq-heading', label: 'Section Heading', type: 'text', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Skills & Requirements' },
  { id: 'seo-skillreq-subtext', label: 'Section Subtext', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Skills & Requirements' },
  { id: 'seo-skillreq-skills-list', label: 'Core Skills List', type: 'repeater-checklist', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Skills & Requirements' },
  { id: 'seo-skillreq-req-list', label: 'Requirements List', type: 'repeater-checklist', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Skills & Requirements' },
  { id: 'seo-skillreq-callout', label: 'Closing Callout', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Skills & Requirements' },

  { id: 'seo-process-subtext', label: 'Section Subtext', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Process' },
  { id: 'seo-process-steps', label: 'Steps', type: 'repeater-steps', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Process' },

  { id: 'seo-faq-heading', label: 'Section Heading', type: 'text', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'FAQ' },
  { id: 'seo-faq-list', label: 'FAQ Items', type: 'repeater-faq', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'FAQ' },

  { id: 'seo-contact-heading', label: 'Banner Heading', type: 'text', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Contact' },
  { id: 'seo-contact-subtext', label: 'Banner Subtext', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', page: 'SEO Landing Page', group: 'Contact' },

  { id: 'blog-meta-title', label: 'Page Title (SEO)', type: 'text', file: 'blog/index.html', page: 'Blog', group: 'SEO' },
  { id: 'blog-meta-description', label: 'Meta Description (SEO)', type: 'textarea', file: 'blog/index.html', page: 'Blog', group: 'SEO' },
  { id: 'blog-h1', label: 'Page Headline', type: 'text', file: 'blog/index.html', page: 'Blog', group: 'Header' },
  { id: 'blog-lead', label: 'Page Subtext', type: 'textarea', file: 'blog/index.html', page: 'Blog', group: 'Header' },

  { id: 'article-meta-title', label: 'Page Title (SEO)', type: 'text', file: 'what-is-seo-and-how-does-it-work/index.html', page: 'Article — What Is SEO', group: 'SEO' },
  { id: 'article-meta-description', label: 'Meta Description (SEO)', type: 'textarea', file: 'what-is-seo-and-how-does-it-work/index.html', page: 'Article — What Is SEO', group: 'SEO' },
  { id: 'article-h1', label: 'Article Headline', type: 'text', file: 'what-is-seo-and-how-does-it-work/index.html', page: 'Article — What Is SEO', group: 'Header' },
  { id: 'article-body', label: 'Article Body', type: 'richtext-full', file: 'what-is-seo-and-how-does-it-work/index.html', page: 'Article — What Is SEO', group: 'Body' },
];

function fieldsByFile() {
  const map = {};
  for (const f of FIELDS) {
    if (!map[f.file]) map[f.file] = [];
    map[f.file].push(f);
  }
  return map;
}

module.exports = { FIELDS, fieldsByFile };
