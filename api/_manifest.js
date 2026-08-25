// Every editable field on the site. `id` must match the marker id used in the
// HTML comments (<!--cms:id-->...<!--cms:/id--> or <!--cms-attr:id:attr:transform-->).
// type is a UI hint only: text = single line, textarea = multi line,
// richtext = formatting box with Bold/Italic, repeater-steps/repeater-faq = add/remove card lists.
const FIELDS = [
  { id: 'meta-title', label: 'Page Title (SEO)', type: 'text', file: 'index.html', group: 'Homepage — SEO' },
  { id: 'meta-description', label: 'Meta Description (SEO)', type: 'textarea', file: 'index.html', group: 'Homepage — SEO' },

  { id: 'hero-h1', label: 'Hero Headline', type: 'text', file: 'index.html', group: 'Homepage — Hero' },
  { id: 'hero-lead', label: 'Hero Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Hero' },

  { id: 'trust-heading', label: 'Section Heading', type: 'text', file: 'index.html', group: 'Homepage — Trusted By' },
  { id: 'trust-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Trusted By' },

  { id: 'about-heading', label: 'Section Heading', type: 'text', file: 'index.html', group: 'Homepage — About' },
  { id: 'about-body', label: 'Body', type: 'richtext', file: 'index.html', group: 'Homepage — About' },

  { id: 'engage-heading', label: 'Section Heading', type: 'text', file: 'index.html', group: 'Homepage — Video Portfolio' },
  { id: 'engage-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Video Portfolio' },

  { id: 'process-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Process' },
  { id: 'process-steps', label: 'Steps', type: 'repeater-steps', file: 'index.html', group: 'Homepage — Process' },

  { id: 'skills-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Skills' },
  { id: 'tools-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Tools' },
  { id: 'insights-subtext', label: 'Section Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Insights' },

  { id: 'faq-list', label: 'FAQ Items', type: 'repeater-faq', file: 'index.html', group: 'Homepage — FAQ' },

  { id: 'contact-cta-heading', label: 'Banner Heading', type: 'text', file: 'index.html', group: 'Homepage — Contact' },
  { id: 'contact-cta-subtext', label: 'Banner Subtext', type: 'textarea', file: 'index.html', group: 'Homepage — Contact' },
  { id: 'contact-lead', label: 'Section Intro', type: 'textarea', file: 'index.html', group: 'Homepage — Contact' },
  { id: 'contact-email', label: 'Contact Email (updates every place it appears, including the footer)', type: 'text', file: 'index.html', group: 'Homepage — Contact' },
  { id: 'contact-phone', label: 'Contact Phone — format: +977 9848853606 (updates tel:, WhatsApp and display text)', type: 'text', file: 'index.html', group: 'Homepage — Contact' },

  { id: 'footer-heading', label: 'Footer Heading', type: 'text', file: 'index.html', group: 'Homepage — Footer' },

  { id: 'seo-meta-title', label: 'Page Title (SEO)', type: 'text', file: 'best-seo-expert-in-nepal/index.html', group: 'SEO Landing Page' },
  { id: 'seo-meta-description', label: 'Meta Description (SEO)', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', group: 'SEO Landing Page' },
  { id: 'seo-hero-h1', label: 'Hero Headline', type: 'text', file: 'best-seo-expert-in-nepal/index.html', group: 'SEO Landing Page' },
  { id: 'seo-hero-lead', label: 'Hero Subtext', type: 'textarea', file: 'best-seo-expert-in-nepal/index.html', group: 'SEO Landing Page' },
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
