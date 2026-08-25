const { SITE_ORIGIN } = require('./_posts');

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderStandalonePage(page) {
  const url = `${SITE_ORIGIN}/${page.slug}/`;
  const metaTitle = page.metaTitle || page.title;
  const metaDescription = page.metaDescription || '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(metaTitle)} | Prabal Raj Shakya</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/png" href="../favicon.png">
  <link rel="apple-touch-icon" href="../favicon.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:url" content="${url}">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PNTQLVMZK0"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-PNTQLVMZK0');
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --canvas: #ffffff; --surface: #f7f8fb; --surface-2: #eef1f7; --hairline: #e5e7eb;
      --accent: #2563eb; --accent-soft: #dbeafe; --ink: #0f172a; --muted: #475569; --dim: #94a3b8;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: var(--canvas); color: var(--ink); font-family: Poppins, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
    .wrap { width: min(880px, calc(100% - 32px)); margin: 0 auto; }
    .nav { position: sticky; top: 0; z-index: 5; border-bottom: 1px solid var(--hairline); background: rgba(255,255,255,.88); backdrop-filter: blur(14px); }
    .nav-inner { width: min(1180px, calc(100% - 32px)); margin: 0 auto; height: 64px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; }
    .nav ul { list-style: none; display: flex; gap: 26px; justify-content: center; margin: 0; padding: 0; color: var(--muted); font-size: 14px; font-weight: 600; }
    .nav a:hover { color: var(--accent); }
    .dropdown { position: relative; }
    .dropdown-toggle { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }
    .dropdown-toggle:after { content: ""; width: 6px; height: 6px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg) translateY(-2px); transition: transform .2s ease; }
    .dropdown:hover .dropdown-toggle, .dropdown:focus-within .dropdown-toggle { color: var(--accent); }
    .dropdown:hover .dropdown-toggle:after, .dropdown:focus-within .dropdown-toggle:after { transform: rotate(225deg) translateY(2px); }
    .dropdown-menu { position: absolute; top: 100%; left: 50%; margin-top: 14px; min-width: 190px; background: var(--canvas); border: 1px solid var(--hairline); border-radius: 14px; box-shadow: 0 20px 40px rgba(15,23,42,.12); padding: 8px; z-index: 10; opacity: 0; visibility: hidden; transform: translateX(-50%) translateY(6px); transition: opacity .2s ease, transform .2s ease, visibility .2s; }
    .dropdown:hover .dropdown-menu, .dropdown:focus-within .dropdown-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
    .dropdown-menu a { display: block; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--muted); white-space: nowrap; }
    .dropdown-menu a:hover { background: var(--surface); color: var(--accent); }
    .nav ul.dropdown-menu { flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 2px; }
    .nav-toggle { display: none; align-items: center; justify-content: center; flex-direction: column; gap: 4px; width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--hairline); background: var(--canvas); cursor: pointer; padding: 0; }
    .nav-toggle span { display: block; width: 18px; height: 2px; background: var(--ink); border-radius: 2px; transition: transform .25s ease, opacity .25s ease; }
    .nav-toggle.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
    .nav-toggle.open span:nth-child(2) { opacity: 0; }
    .nav-toggle.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
    .pill { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 999px; padding: 11px 18px; border: 1px solid var(--hairline); background: var(--canvas); font-weight: 700; font-size: 14px; }
    .pill.primary { position: relative; overflow: hidden; background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 14px 30px rgba(37,99,235,.22); }
    .page-hero { padding: 64px 0 16px; text-align: center; }
    .section-label { display: block; color: var(--accent); font-size: 12px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; }
    .page-hero h1 { margin: 10px 0 0; font-size: clamp(32px, 4.6vw, 48px); line-height: 1.14; font-weight: 800; letter-spacing: -0.02em; color: #1c2a6b; }
    .page-hero .lead { margin: 16px auto 0; max-width: 620px; font-size: 16px; color: var(--muted); line-height: 1.75; }
    .hero-image { margin: 32px 0 0; border-radius: 20px; overflow: hidden; aspect-ratio: 16/7; background: var(--surface-2); }
    .hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
    article.prose { padding: 40px 0 20px; color: var(--muted); line-height: 1.8; font-size: 16px; }
    article.prose p { margin: 0 0 20px; }
    article.prose h2 { color: var(--ink); font-size: 26px; font-weight: 800; letter-spacing: -0.01em; margin: 40px 0 14px; }
    article.prose h3 { color: var(--ink); font-size: 19px; font-weight: 800; margin: 28px 0 10px; }
    article.prose ul, article.prose ol { margin: 0 0 20px; padding-left: 22px; }
    article.prose li { margin-bottom: 8px; }
    article.prose a { color: var(--accent); font-weight: 700; }
    article.prose strong { color: var(--ink); }
    .cta-banner { border-radius: 28px; background: #1c2a6b; padding: 44px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; margin: 40px 0 64px; }
    .cta-banner h3 { color: #fff; font-size: clamp(20px, 3vw, 26px); max-width: 460px; margin: 0; }
    .cta-banner p { color: #c7d2fe; margin-top: 8px; max-width: 420px; font-size: 14px; }
    .btn-white { display: inline-flex; align-items: center; justify-content: center; padding: 13px 26px; border-radius: 10px; font-weight: 700; font-size: 14px; background: #fff; color: #1c2a6b; }
    .btn-whatsapp { display: inline-flex; align-items: center; justify-content: center; padding: 13px 26px; border-radius: 10px; font-weight: 700; font-size: 14px; background: #25D366; color: #063d1e; }
    .cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    footer { background: #05070f; color: #fff; padding: 72px 0 32px; }
    .footer-grid { display: flex; justify-content: space-between; gap: 60px; flex-wrap: wrap; width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    .footer-cta-col { max-width: 420px; }
    .footer-eyebrow { display: block; color: #7dd3fc; font-size: 12px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; margin-bottom: 14px; }
    .footer-heading { color: #fff; font-size: clamp(28px, 3.2vw, 38px); line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 28px; }
    .footer-cta-btn { display: inline-flex; align-items: center; gap: 10px; background: #fff; color: #0f172a; font-weight: 700; font-size: 14px; padding: 14px 22px; border-radius: 999px; }
    .footer-email-label { display: block; color: #7dd3fc; font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; margin: 28px 0 12px; }
    .footer-email-pill { display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.15); color: #fff; font: inherit; font-size: 14px; font-weight: 600; padding: 12px 18px; border-radius: 999px; cursor: pointer; }
    .footer-links { display: flex; gap: 64px; flex-wrap: wrap; }
    .footer-links-col h3 { color: #7dd3fc; font-size: 12px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; margin-bottom: 18px; }
    .footer-links-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .footer-links-col a { color: rgba(255,255,255,.75); font-size: 14px; font-weight: 600; }
    .footer-links-col a:hover { color: #fff; }
    .footer-divider { border: 0; border-top: 1px solid rgba(255,255,255,.12); margin: 56px 0 24px; width: min(1180px, calc(100% - 32px)); margin-left: auto; margin-right: auto; }
    .footer-bottom-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    .footer-bottom-row p { margin: 0; color: rgba(255,255,255,.5); font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
    .footer-social-plain { display: flex; gap: 20px; }
    .footer-social-plain a { color: #fff; opacity: .85; }
    @media (max-width: 880px) {
      .nav-inner { grid-template-columns: auto 1fr auto; }
      .nav-toggle { display: flex; }
      .nav ul { display: none; position: absolute; top: 64px; left: 0; right: 0; flex-direction: column; align-items: stretch; gap: 2px; background: var(--canvas); border-bottom: 1px solid var(--hairline); padding: 12px 20px 20px; max-height: calc(100vh - 64px); overflow-y: auto; box-shadow: 0 20px 30px rgba(15,23,42,.08); }
      .nav ul.open { display: flex; }
      .nav ul li { width: 100%; }
      .nav ul a, .nav .dropdown-toggle { display: flex; align-items: center; padding: 12px 4px; width: 100%; justify-content: space-between; }
      .dropdown-menu { position: static; opacity: 1; visibility: visible; transform: none; box-shadow: none; border: 0; padding: 0 0 0 14px; margin: 0; min-width: 0; display: none; }
      .dropdown.open-sub .dropdown-menu { display: flex; }
      .dropdown:hover .dropdown-menu, .dropdown:focus-within .dropdown-menu { transform: none; }
      .dropdown.open-sub .dropdown-toggle:after { transform: rotate(225deg) translateY(2px); }
      .cta-banner { flex-direction: column; align-items: flex-start; text-align: left; }
    }
  </style>
</head>
<body>
  <header class="nav">
    <div class="nav-inner">
      <button type="button" class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navList"><span></span><span></span><span></span></button>
      <nav>
        <ul id="navList">
          <li><a href="../">Home</a></li>
          <li class="dropdown"><span class="dropdown-toggle" tabindex="0">Services</span><ul class="dropdown-menu"><li><a href="../best-seo-expert-in-nepal/">SEO Services</a></li></ul></li>
          <li><a href="../#about">About</a></li>
          <li><a href="../#tools">Tools</a></li>
          <li class="dropdown"><span class="dropdown-toggle" tabindex="0">Community</span><ul class="dropdown-menu"><li><a href="../#faq">FAQ</a></li><li><a href="../blog/">Blog</a></li></ul></li>
          <li><a href="../#contact">Contact</a></li>
        </ul>
      </nav>
      <a class="pill primary" href="../#contact">Hire Me</a>
    </div>
  </header>

  <main>
    <div class="wrap">
      <div class="page-hero">
        <span class="section-label">${escapeHtml(page.eyebrow || 'Page')}</span>
        <h1>${escapeHtml(page.title)}</h1>
        ${page.lead ? `<p class="lead">${escapeHtml(page.lead)}</p>` : ''}
        ${page.heroImage ? `<div class="hero-image"><img src="${page.heroImage}" alt="${escapeHtml(page.title)}" loading="eager"></div>` : ''}
      </div>

      <article class="prose">${page.body || ''}</article>

      <div class="cta-banner">
        <div>
          <h3>${escapeHtml(page.ctaHeading || "Ready to work together?")}</h3>
          <p>${escapeHtml(page.ctaSubtext || "Send a message or WhatsApp me directly and let's talk about your project.")}</p>
        </div>
        <div class="cta-actions">
          <a class="btn-white" href="../#contact-form">Contact Us</a>
          <a class="btn-whatsapp" href="https://wa.me/9779848853606" target="_blank" rel="noreferrer">WhatsApp Me</a>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-grid">
      <div class="footer-cta-col">
        <span class="footer-eyebrow">Contact Us</span>
        <p class="footer-heading">Let's Discuss Your Growth. With Me.</p>
        <a class="footer-cta-btn" href="../#contact">Get in Touch</a>
        <span class="footer-email-label">Or Email Us At</span>
        <button type="button" class="footer-email-pill" id="footerEmailCopy" data-email="prabalraj980@gmail.com"><span>prabalraj980@gmail.com</span></button>
      </div>
      <div class="footer-links">
        <div class="footer-links-col">
          <h3>Quick Links</h3>
          <ul><li><a href="../">Home</a></li><li><a href="../#skills">Skills</a></li><li><a href="../#tools">Tools</a></li><li><a href="../#experience">Experience</a></li><li><a href="../#about">About</a></li></ul>
        </div>
        <div class="footer-links-col">
          <h3>Explore</h3>
          <ul><li><a href="../best-seo-expert-in-nepal/">SEO Services</a></li><li><a href="../blog/">Blog</a></li><li><a href="../#faq">FAQ</a></li><li><a href="../#achievements">Achievements</a></li></ul>
        </div>
      </div>
    </div>
    <hr class="footer-divider">
    <div class="footer-bottom-row">
      <p>© Prabal Raj Shakya 2026. All rights reserved.</p>
      <div class="footer-social-plain">
        <a href="https://linkedin.com/in/prabal-raj-shakya-b640222b7" target="_blank" rel="noreferrer" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="https://wa.me/9779848853606" target="_blank" rel="noreferrer" aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
        <a href="mailto:prabalraj980@gmail.com" aria-label="Email"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 7 10 6 10-6"></path></svg></a>
      </div>
    </div>
  </footer>

  <script>
    (function () {
      var navToggle = document.getElementById('navToggle');
      var navList = document.getElementById('navList');
      if (navToggle && navList) {
        navToggle.addEventListener('click', function () {
          var isOpen = navList.classList.toggle('open');
          navToggle.classList.toggle('open', isOpen);
          navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        navList.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', function () {
            navList.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
          });
        });
      }
      document.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
        toggle.addEventListener('click', function () {
          var parent = toggle.closest('.dropdown');
          if (parent) parent.classList.toggle('open-sub');
        });
      });
      var emailCopyBtn = document.getElementById('footerEmailCopy');
      if (emailCopyBtn) {
        emailCopyBtn.addEventListener('click', function () {
          var email = emailCopyBtn.getAttribute('data-email');
          var label = emailCopyBtn.querySelector('span');
          var original = label.textContent;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(function () {
              label.textContent = 'Copied!';
              setTimeout(function () { label.textContent = original; }, 1500);
            }).catch(function () { window.location.href = 'mailto:' + email; });
          } else {
            window.location.href = 'mailto:' + email;
          }
        });
      }
    })();
  </script>
</body>
</html>
`;
}

module.exports = { renderStandalonePage };
