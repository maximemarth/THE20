/* ==========================================================================
   THE 20 — Script principal (v2)
   Chaque fonction init...() gère UNE fonctionnalité. Pour en désactiver une,
   il suffit de commenter sa ligne dans init() tout en bas.

   Règle d'accessibilité : si le visiteur a demandé "réduire les animations"
   (prefers-reduced-motion), toutes les animations sont coupées et le contenu
   s'affiche directement dans son état final.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  /* --------------------------------------------------------------------------
     1. Découpe du texte en mots (pour les animations de titres)
        data-split="reveal" : les mots montent un par un à l'entrée à l'écran
        data-split="lit"    : les mots s'allument pendant le scroll
     -------------------------------------------------------------------------- */
  function splitWords(el) {
    var label = el.textContent.replace(/\s+/g, ' ').trim();
    var visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    var words = [];
    var index = 0;

    // Parcourt les nœuds en gardant les balises internes (ex. <span class="accent">)
    function walk(node, target) {
      Array.prototype.forEach.call(node.childNodes, function (child) {
        if (child.nodeType === 3) {
          // On coupe uniquement sur les espaces normaux : l'espace insécable (&nbsp;) garde "20 %" ensemble
          child.textContent.split(/([ \t\n]+)/).forEach(function (part) {
            if (!part) return;
            if (/^[ \t\n]+$/.test(part)) { target.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            var inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--i', index++);
            w.appendChild(inner);
            target.appendChild(w);
            words.push(w);
          });
        } else if (child.nodeType === 1) {
          var clone = child.cloneNode(false);
          target.appendChild(clone);
          walk(child, clone);
        }
      });
    }

    walk(el, visual);
    el.textContent = '';
    // Version lisible par les lecteurs d'écran + version animée masquée pour eux
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.appendChild(sr);
    el.appendChild(visual);
    return words;
  }

  /* --------------------------------------------------------------------------
     2. Header : ombre + réduction au scroll, barre de progression, lien actif
     -------------------------------------------------------------------------- */
  var litBlocks = [];     // textes "lit" mis à jour au scroll
  var timeline = null;    // timeline "Comment ça marche"

  function initScrollEffects() {
    var header = $('#header');
    var hero = $('[data-hero]');
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;

      if (header) header.classList.toggle('is-scrolled', y > 20);
      document.documentElement.style.setProperty('--scroll', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);

      // Textes qui s'allument mot à mot
      litBlocks.forEach(function (block) {
        var r = block.el.getBoundingClientRect();
        var p = clamp((vh * 0.88 - r.top) / (vh * 0.45 + r.height * 0.6), 0, 1);
        var count = Math.round(p * block.words.length);
        block.words.forEach(function (w, i) { w.classList.toggle('is-lit', i < count); });
      });

      // Timeline : le fil se remplit et les étapes s'activent
      if (timeline) {
        var tr = timeline.el.getBoundingClientRect();
        var horizontal = window.matchMedia('(min-width: 1100px)').matches;
        var p2;
        if (horizontal) {
          p2 = clamp((vh * 0.85 - tr.top) / (vh * 0.4), 0, 1);
        } else {
          p2 = clamp((vh * 0.62 - tr.top) / tr.height, 0, 1);
        }
        timeline.el.style.setProperty('--p', p2.toFixed(3));
        timeline.steps.forEach(function (step, i) {
          var active;
          if (horizontal) {
            active = p2 >= (i - 0.05) / (timeline.steps.length - 1);
          } else {
            var sr = step.getBoundingClientRect();
            active = sr.top + sr.height * 0.3 < vh * 0.62;
          }
          step.classList.toggle('is-active', active);
        });
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    // Léger déplacement du hero selon la souris (profondeur)
    if (hero && finePointer && !reduced) {
      var raf = 0;
      hero.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = 0;
          var r = hero.getBoundingClientRect();
          hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        });
      });
      hero.addEventListener('pointerleave', function () {
        hero.style.setProperty('--px', 0);
        hero.style.setProperty('--py', 0);
      });
    }
  }

  // Surligne dans le menu la section actuellement à l'écran
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav-desktop a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-current'); });
        var link = map[entry.target.id];
        if (link) link.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* --------------------------------------------------------------------------
     3. Menu mobile (burger) — accessible : aria-expanded, Échap, fermeture au clic
     -------------------------------------------------------------------------- */
  function initMobileMenu() {
    var burger = $('#burger');
    var nav = $('#nav-mobile');
    if (!burger || !nav) return;

    function setOpen(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) setOpen(false); });
  }

  /* --------------------------------------------------------------------------
     4. Apparitions au scroll (fade + translate, titres mot par mot, visuels)
     -------------------------------------------------------------------------- */
  function initReveal() {
    // Titres découpés
    $$('[data-split="reveal"]').forEach(function (el) {
      splitWords(el);
      if (el.closest('[data-hero]')) el.style.setProperty('--base', '250ms');
    });
    $$('[data-split="lit"]').forEach(function (el) {
      var words = splitWords(el);
      litBlocks.push({ el: el, words: words });
    });

    var targets = $$('.reveal, [data-split="reveal"], [data-gauge], [data-foot]');

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      litBlocks.forEach(function (b) { b.words.forEach(function (w) { w.classList.add('is-lit'); }); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        io.unobserve(el);
        if (el.classList.contains('reveal')) {
          window.setTimeout(function () { el.classList.add('is-done'); }, 1600);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------------------
     5. Compteurs (80 % de la jauge)
     -------------------------------------------------------------------------- */
  function initCounters() {
    var counters = $$('[data-count]');
    if (!counters.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (reduced) { el.textContent = target; return; }
      var start = null;
      var duration = 1900;
      var delay = 500;                 // aligné sur le tracé de la jauge
      el.textContent = '0';
      function frame(ts) {
        if (start === null) start = ts;
        var t = clamp((ts - start - delay) / duration, 0, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) { counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------------------
     6. Visuels de la méthode : points Pareto, barres de constance, timeline
     -------------------------------------------------------------------------- */
  function initVisuals() {
    // 100 points ; les 20 de cette liste s'allument en cascade (loi de Pareto)
    var dotsBox = $('[data-dots]');
    if (dotsBox) {
      var onIndexes = [3, 11, 17, 24, 29, 35, 38, 42, 47, 53, 56, 61, 66, 72, 75, 81, 86, 90, 94, 98];
      var frag = document.createDocumentFragment();
      var order = 0;
      for (var i = 0; i < 100; i++) {
        var d = document.createElement('span');
        d.className = 'dot';
        if (onIndexes.indexOf(i) !== -1) {
          d.classList.add('on');
          d.style.transitionDelay = (0.3 + order * 0.09).toFixed(2) + 's';
          order++;
        }
        frag.appendChild(d);
      }
      dotsBox.appendChild(frag);

      var lightUp = function () { $$('.dot.on', dotsBox).forEach(function (d) { d.classList.add('lit'); }); };
      if (reduced || !('IntersectionObserver' in window)) {
        lightUp();
      } else {
        var dotsIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { lightUp(); dotsIO.disconnect(); }
          });
        }, { threshold: 0.4 });
        dotsIO.observe(dotsBox);
      }
    }

    // 30 barres = 30 jours (le CSS les fait monter l'une après l'autre)
    var ticksBox = $('[data-ticks]');
    if (ticksBox) {
      for (var n = 0; n < 30; n++) {
        var t = document.createElement('i');
        t.style.setProperty('--n', n);
        ticksBox.appendChild(t);
      }
    }

    // Timeline (animée dans initScrollEffects)
    var tl = $('[data-timeline]');
    if (tl) timeline = { el: tl, steps: $$('.step', tl) };
  }

  /* --------------------------------------------------------------------------
     7. Boutons "magnétiques" et cartes avec projecteur (souris uniquement)
     -------------------------------------------------------------------------- */
  function initPointerEffects() {
    if (!finePointer || reduced) return;

    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.32;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });

    $$('.spot').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. Formulaire de contact — validation front + confirmation simulée
     -------------------------------------------------------------------------- */
  function initContactForm() {
    var form = $('#contact-form');
    var confirmation = $('#form-confirmation');
    if (!form || !confirmation) return;

    var prenom = $('#prenom');
    var email = $('#email');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var submittedOnce = false;

    function validate(input, isValid) {
      var field = input.closest('[data-field]');
      field.classList.toggle('has-error', !isValid);
      input.setAttribute('aria-invalid', String(!isValid));
      return isValid;
    }
    function checkPrenom() { return validate(prenom, prenom.value.trim() !== ''); }
    function checkEmail() { return validate(email, emailPattern.test(email.value.trim())); }

    // Une fois une première tentative faite, on corrige en direct
    prenom.addEventListener('input', function () { if (submittedOnce) checkPrenom(); });
    email.addEventListener('input', function () { if (submittedOnce) checkEmail(); });
    email.addEventListener('blur', function () { if (email.value) checkEmail(); });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submittedOnce = true;
      var okPrenom = checkPrenom();
      var okEmail = checkEmail();

      if (!okPrenom || !okEmail) {
        (okPrenom ? email : prenom).focus();   // focus sur le 1er champ en erreur
        return;
      }

      // -----------------------------------------------------------------------
      // TODO Maxime : brancher ici Calendly, Formspree ou un webhook pour recevoir réellement les demandes
      // Exemple Formspree :
      //   fetch('https://formspree.io/f/xxxxxxx', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      //     .then(function (res) { if (res.ok) { /* afficher la confirmation ci-dessous */ } });
      // Exemple Calendly : remplacer ce bloc par l'ouverture d'un widget Calendly (voir README.md).
      // Les données saisies sont disponibles via : new FormData(form)
      // -----------------------------------------------------------------------

      form.hidden = true;
      confirmation.classList.add('is-visible');
      confirmation.focus();
    });
  }

  /* --------------------------------------------------------------------------
     Démarrage
     -------------------------------------------------------------------------- */
  function init() {
    initVisuals();          // doit passer avant initReveal (crée les points/barres)
    initReveal();
    initCounters();
    initScrollEffects();
    initScrollSpy();
    initMobileMenu();
    initPointerEffects();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
