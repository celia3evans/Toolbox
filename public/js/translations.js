'use strict';

/**
 * translations.js — Single source of truth for all UI text.
 *
 * Every string in the app lives here as { en: '...', fr: '...' }.
 * Keys are dot-namespaced by section. To add or edit a translation,
 * change it in this file only — no HTML or JS files need to be touched.
 *
 * Used by i18n.js:
 *   - HTML elements with data-i18n="key" have their textContent set here.
 *   - JS code calls getString('key') to get the active-language string.
 */

const TRANSLATIONS = {

  // ── Navigation ──────────────────────────────────────────────────────────
  'nav.home':          { en: 'Home',              fr: 'Accueil' },
  'nav.resources':     { en: 'All Resources',     fr: 'Toutes les ressources' },
  'nav.saved':         { en: 'Saved',             fr: 'Enregistrées' },
  'nav.profile':       { en: 'Profile',           fr: 'Profil' },
  'nav.about':         { en: 'About',             fr: 'À propos' },

  // ── Landing page ────────────────────────────────────────────────────────
  'landing.title':     { en: 'Toolbox',           fr: 'Toolbox' },
  'landing.tagline':   {
    en: 'Forging strong engineering students and societies.',
    fr: 'Forger de solides étudiant·e·s en génie et des associations étudiantes.',
  },
  'landing.bubble.resources': { en: 'All Resources',  fr: 'Toutes les ressources' },
  'landing.bubble.saved':     { en: 'Saved',           fr: 'Enregistrées' },
  'landing.bubble.profile':   { en: 'Profile',         fr: 'Profil' },
  'landing.bubble.about':     { en: 'About',           fr: 'À propos' },

  // ── All Resources page ──────────────────────────────────────────────────
  'resources.heading':    { en: 'All Resources',       fr: 'Toutes les ressources' },
  'resources.search':     { en: 'Search resources…',   fr: 'Rechercher des ressources…' },
  'filter.heading':       { en: 'Filters',             fr: 'Filtres' },
  'filter.categories':    { en: 'Categories',          fr: 'Catégories' },
  'filter.freeOnly':      { en: 'Free only',           fr: 'Gratuit seulement' },

  // ── Category page ───────────────────────────────────────────────────────
  'category.search':      { en: 'Search resources…',   fr: 'Rechercher des ressources…' },
  'category.backHome':    { en: 'Back to Home',         fr: 'Retour à l\'accueil' },

  // ── Saved page ──────────────────────────────────────────────────────────
  'saved.heading':        { en: 'Saved Resources',      fr: 'Ressources enregistrées' },
  'saved.browseAll':      { en: 'Browse all resources', fr: 'Parcourir toutes les ressources' },

  // ── Profile page ────────────────────────────────────────────────────────
  'profile.heading':      { en: 'Profile',              fr: 'Profil' },
  'profile.signinDesc':   {
    en: 'Sign in to access your profile.',
    fr: 'Connectez-vous pour accéder à votre profil.',
  },
  'profile.signinBtn':    { en: 'Sign in with Google',  fr: 'Se connecter avec Google' },
  'profile.signoutBtn':   { en: 'Sign out',             fr: 'Se déconnecter' },

  // ── About page ──────────────────────────────────────────────────────────
  'about.heading':        { en: 'About',                fr: 'À propos' },
  'about.orgName':        {
    en: 'Canadian Federation of Engineering Students (CFES)',
    fr: 'Fédération canadienne des sociétés d\'ingénierie (FCEG)',
  },
  'about.mission':        {
    en: 'The CFES Toolbox is a curated hub of resources for engineering students and student societies across Canada. Our mission is to forge strong engineering students and societies by making essential resources accessible to all.',
    fr: 'La Boîte à outils de la FCEG est un recueil de ressources pour les étudiants en génie et les associations étudiantes à travers le Canada. Notre mission est de forger de solides étudiant·e·s en génie et des associations étudiantes en rendant les ressources essentielles accessibles à tous.',
  },
  'about.visitLink':      { en: 'Visit the CFES website',    fr: 'Visiter le site Web de la FCEG' },
  'about.contact':        {
    en: 'For questions or resource submissions, contact us through the CFES website.',
    fr: 'Pour des questions ou des soumissions de ressources, contactez-nous via le site Web de la FCEG.',
  },

  // ── Shared states ───────────────────────────────────────────────────────
  'state.loading':        { en: 'Loading…',              fr: 'Chargement…' },
  'state.noResults':      { en: 'No results found.',     fr: 'Aucun résultat trouvé.' },
  'state.noSaved':        { en: 'No saved resources yet.', fr: 'Aucune ressource enregistrée.' },

  // ── Errors ──────────────────────────────────────────────────────────────
  'error.load':           { en: 'Failed to load resources.',  fr: 'Impossible de charger les ressources.' },
  'error.retry':          { en: 'Retry',                      fr: 'Réessayer' },
  'error.nocat':          { en: 'Category not found.',        fr: 'Catégorie introuvable.' },
};

// Expose on window for inline page scripts.
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
}

// CommonJS export for Jest tests.
if (typeof module !== 'undefined') {
  module.exports = { TRANSLATIONS };
}
