/* =========================================================
   Everyday Simple Living — GSAP scroll animations
   Progressive enhancement: the site works fine without JS.
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Reading progress bar (no GSAP needed) ---------- */
  var bar = document.getElementById('progress');
  if (bar) {
    var updateBar = function () {
      var height = doc.scrollHeight - window.innerHeight;
      var progress = height > 0 ? window.scrollY / height : 0;
      progress = Math.max(0, Math.min(1, progress));
      bar.style.transform = 'scaleX(' + progress + ')';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();
  }

  /* ---------- 2. Bail out gracefully ---------- */
  var bailOut = function () {
    doc.classList.remove('js');
    doc.classList.add('no-anim');
  };

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    bailOut();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (prefersReduced) {
    bailOut();
    return;
  }

  var EASE = 'power3.out';
  var isArticle = !!document.querySelector('.single-article');

  /* ---------- 3. Hero (homepage) ---------- */
  if (document.querySelector('.hero')) {
    // NOTE: set + explicit end values (not .from) because the CSS pre-hide
    // rule makes .from() read opacity:0 as its target and never animate in.
    var heroEls = gsap.utils.toArray('.hero .kicker, .hero h1, .hero p, .hero .btn');
    gsap.set(heroEls, { y: 30, autoAlpha: 0 });

    gsap.timeline({ defaults: { ease: EASE, duration: 0.9 } })
      .to('.hero .kicker', { y: 0, autoAlpha: 1, duration: 0.7 })
      .to('.hero h1', { y: 0, autoAlpha: 1 }, '-=0.45')
      .to('.hero p', { y: 0, autoAlpha: 1 }, '-=0.5')
      .to('.hero .btn', { y: 0, autoAlpha: 1, duration: 0.7 }, '-=0.5');

    // Parallax: content drifts up & fades, background moves slower
    gsap.to('.hero-inner', {
      yPercent: -16,
      autoAlpha: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.fromTo('.hero', { backgroundPositionY: '0%' }, {
      backgroundPositionY: '22%',
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- 4. Section heading underlines ---------- */
  gsap.utils.toArray('.section-head').forEach(function (head) {
    ScrollTrigger.create({
      trigger: head,
      start: 'top 90%',
      onEnter: function () { head.classList.add('is-in'); },
      once: true
    });
  });

  /* ---------- 5. Generic reveals ---------- */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.fromTo(el,
      { y: 42, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 1, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  /* ---------- 6. Staggered article cards ---------- */
  var cards = gsap.utils.toArray('[data-reveal-stagger]');
  if (cards.length) {
    gsap.set(cards, { y: 54, autoAlpha: 0, scale: 0.985 });
    ScrollTrigger.batch(cards, {
      start: 'top 88%',
      batchMax: 4,
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0, autoAlpha: 1, scale: 1,
          duration: 0.95, ease: EASE, stagger: 0.13, overwrite: true
        });
      }
    });
  }

  /* ---------- 7. Image parallax inside media frames ---------- */
  gsap.utils.toArray('.parallax-img').forEach(function (frame) {
    var img = frame.querySelector('img');
    if (!img) { return; }
    gsap.fromTo(img,
      { yPercent: -8, scale: 1.16 },
      {
        yPercent: 8, scale: 1.16, ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
      }
    );
  });

  /* ---------- 8. Article pages ---------- */
  if (isArticle) {
    var heroImg = document.querySelector('.post-hero-wrap');
    var headerEls = gsap.utils.toArray('.single-article .meta, .single-article h1, .single-article .byline');
    gsap.set(headerEls, { y: 28, autoAlpha: 0 });

    var headerTl = gsap.timeline({ defaults: { ease: EASE } })
      .to('.single-article .meta', { y: 0, autoAlpha: 1, duration: 0.6 })
      .to('.single-article h1', { y: 0, autoAlpha: 1, duration: 0.85 }, '-=0.3')
      .to('.single-article .byline', { y: 0, autoAlpha: 1, duration: 0.7 }, '-=0.5');

    if (heroImg) {
      gsap.set(heroImg, { autoAlpha: 0, y: 24 });
      headerTl.to(heroImg, { autoAlpha: 1, y: 0, duration: 0.9 }, '-=0.45');
    }

    // Body blocks rise in as you scroll
    var blocks = gsap.utils.toArray(
      '.single-article > p, .single-article > h2, .single-article > h3, .single-article > ul, .single-article > ol'
    );
    if (blocks.length) {
      gsap.set(blocks, { y: 30, autoAlpha: 0 });
      ScrollTrigger.batch(blocks, {
        start: 'top 92%',
        batchMax: 5,
        onEnter: function (batch) {
          gsap.to(batch, {
            y: 0, autoAlpha: 1, duration: 0.7, ease: EASE, stagger: 0.07, overwrite: true
          });
        }
      });
    }

    gsap.fromTo('.back-link', { y: 20, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 0.7, ease: EASE,
      scrollTrigger: { trigger: '.back-link', start: 'top 95%', once: true }
    });
  }

  /* ---------- 9. Recalculate once fonts/images settle ---------- */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
