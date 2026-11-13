/* ==========================================================================
   THE 20 — Script principal
   4 responsabilités : menu mobile, header sticky, animations au scroll,
   validation + envoi simulé du formulaire de contact.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initStickyHeader();
  initScrollReveal();
  initContactForm();
});

/* --------------------------------------------------------------------------
   Menu mobile (burger) — accessible clavier via aria-expanded
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav-mobile');
  if (!burger || !nav) return;

  const closeMenu = () => {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    nav.classList.remove('is-open');
  };

  const openMenu = () => {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    nav.classList.add('is-open');
  };

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Ferme le menu quand on choisit un lien, ou avec la touche Échap
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

/* --------------------------------------------------------------------------
   Header sticky : ajoute une ombre + se réduit légèrement après un petit scroll
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

/* --------------------------------------------------------------------------
   Apparition au scroll (fade + translate) via IntersectionObserver.
   Désactivée si l'utilisateur a demandé "prefers-reduced-motion".
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((item) => observer.observe(item));
}

/* --------------------------------------------------------------------------
   Formulaire de contact — validation front + confirmation simulée.
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const confirmation = document.getElementById('form-confirmation');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    confirmation.classList.remove('is-visible');

    const prenomRow = document.getElementById('prenom').closest('.form-row');
    const emailRow = document.getElementById('email').closest('.form-row');
    const emailInput = document.getElementById('email');
    const prenomInput = document.getElementById('prenom');

    let isValid = true;

    if (prenomInput.value.trim() === '') {
      prenomRow.classList.add('has-error');
      isValid = false;
    } else {
      prenomRow.classList.remove('has-error');
    }

    if (!emailPattern.test(emailInput.value.trim())) {
      emailRow.classList.add('has-error');
      isValid = false;
    } else {
      emailRow.classList.remove('has-error');
    }

    if (!isValid) {
      // Place le focus sur le premier champ en erreur pour l'accessibilité
      form.querySelector('.has-error input')?.focus();
      return;
    }

    // -----------------------------------------------------------------
    // TODO Maxime : brancher ici Calendly, Formspree ou un webhook pour
    // recevoir réellement les demandes (remplacer ce bloc par un vrai
    // envoi, ex. fetch('https://formspree.io/f/xxxx', { method: 'POST', body: new FormData(form) })
    // ou par l'ouverture d'un widget Calendly).
    // -----------------------------------------------------------------

    confirmation.classList.add('is-visible');
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    form.reset();
  });
}
