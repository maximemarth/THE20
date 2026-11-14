# THE 20 — Landing page

Site statique (HTML / CSS / JavaScript vanilla, aucun framework, aucun build) dont l'unique objectif est de générer des réservations d'appel découverte.

Direction visuelle : grands panneaux arrondis, micro-labels en majuscules et titres révélés mot par mot (esprit éditorial de harbor.ai), appliqués à la charte THE 20.

## Lancer le site en local

Aucune installation nécessaire : double-clique sur `index.html`.

Pour un rendu identique à la mise en ligne, tu peux aussi lancer un petit serveur local depuis ce dossier (extension VS Code « Live Server », ou `npx serve` si Node est installé).

## Structure des fichiers

```
index.html             → toutes les sections de la page, dans l'ordre d'affichage
css/style.css          → couleurs, polices, mise en page, responsive, animations
js/script.js           → menu mobile, animations au scroll, formulaire
assets/logo.svg        → logo THE 20 (version claire, pour fonds sombres)
assets/logo-clair.svg  → logo THE 20 (version vert forêt, pour fonds clairs)
assets/favicon.svg     → icône de l'onglet (le « 20 » sur carré anthracite)
```

## Modifier les textes

Tout le texte est dans `index.html`. Chaque section est annoncée par un commentaire, par exemple `<!-- HERO -->`, `<!-- LA MÉTHODE -->`, `<!-- CTA FINAL + FORMULAIRE DE CONTACT -->`. Cherche la phrase à changer et remplace-la.

Les éléments encore à compléter sont marqués clairement :

- `[À REMPLACER : ...]` : années d'expérience / certifications, témoignages, photo.
- `[à compléter]` et `[à adapter]` dans le pied de page : mentions légales, politique de confidentialité, email.
- Les liens Instagram et TikTok pointent vers `#` : remplace `href="#"` par tes vraies adresses.

Deux précautions pour les titres animés (ceux qui portent `data-split`) :

- Écris `20&nbsp;%` (espace insécable) pour que « 20 % » ne soit jamais coupé en fin de ligne.
- Pour colorer un mot en terracotta, entoure-le de `<span class="accent">...</span>`.

## Modifier les couleurs

Toutes les couleurs sont définies une seule fois, en haut de `css/style.css`, dans le bloc `:root` :

```css
:root {
  --vert-foret: #2F4A3D;   /* couleur primaire */
  --terracotta: #C1652F;   /* accent, CTA */
  --anthracite: #26231F;   /* texte / neutre foncé */
  --sable: #F1EAD9;        /* fond clair */
  --ocre: #C9A227;         /* touches ponctuelles */
}
```

Changer une valeur ici met à jour tout le site. Les logos SVG contiennent leurs propres couleurs : si tu changes la palette, modifie aussi les codes couleur dans `assets/*.svg` et dans les trois logos intégrés à `index.html` (header, footer, grand logo de pied de page).

## Modifier les polices

L'appel Google Fonts est dans le `<head>` de `index.html`. Les noms de polices sont ensuite définis dans `css/style.css` (`--font-titres` pour Space Grotesk, `--font-corps` pour Inter). Si les polices ne chargent pas, le site retombe sur une police système.

## Brancher le vrai formulaire de prise de rendez-vous

Le formulaire n'a pas de backend pour l'instant : il valide les champs (prénom requis, email au bon format) puis affiche une confirmation simulée. Aucune donnée n'est envoyée.

Ouvre `js/script.js` et cherche le commentaire :

```js
// TODO Maxime : brancher ici Calendly, Formspree ou un webhook pour recevoir réellement les demandes
```

Trois options :

1. **Formspree** (le plus simple) : crée un formulaire sur formspree.io, puis utilise l'exemple `fetch(...)` déjà écrit en commentaire juste en dessous du TODO, avec ton identifiant.
2. **Calendly** : remplace le formulaire par le widget Calendly intégré, ou fais pointer les boutons « Réserver mon appel » vers ton lien Calendly.
3. **Webhook** (Zapier, Make, n8n) : même principe que Formspree, avec l'adresse de ton webhook.

Une fois le service branché, supprime dans `index.html` la phrase « Ce formulaire est une simulation : aucune donnée n'est encore envoyée. »

## Remplacer la photo

Dans la section `<!-- À PROPOS DU COACH -->`, remplace la ligne

```html
<span>[À REMPLACER : photo portrait de Maxime]</span>
```

par

```html
<img src="assets/maxime.jpg" alt="Maxime, coach sportif THE 20">
```

et dépose le fichier image dans `assets/`. Format conseillé : portrait 4:5, 900 px de large environ, en `.jpg` ou `.webp`.

## Animations

Chaque animation est une fonction séparée dans `js/script.js`, appelée dans `init()` tout en bas du fichier. Pour en désactiver une, commente sa ligne.

| Animation | Où | Fonction |
|---|---|---|
| Logo qui se dessine au chargement | header | CSS (`.logo .draw`) |
| Titre révélé mot par mot | hero | `initReveal` + `data-split="reveal"` |
| Jauge 80/20 qui se remplit, compteur | hero | `initCounters` + CSS (`.gauge`) |
| Texte qui s'allume au scroll | « Le constat » | `initScrollEffects` + `data-split="lit"` |
| 100 points dont 20 s'allument, courbe, 30 barres, bulles | cartes méthode | `initVisuals` + CSS |
| Fil de la timeline qui se remplit au scroll | « Comment ça marche » | `initScrollEffects` |
| Boutons magnétiques, halo sur les cartes | partout (souris uniquement) | `initPointerEffects` |
| Bandeau défilant | sous le hero | CSS (`.marquee`) |

Si le visiteur a activé « réduire les animations » sur son appareil, tout s'affiche directement dans l'état final, sans mouvement. Sans JavaScript, tout le contenu reste visible.

## Responsive

Mise en page fluide (tailles en `clamp()`), avec quatre paliers dans `css/style.css` :

- moins de 720 px : téléphone, une colonne, menu burger
- 720 px et plus : tablette, grilles sur 2 à 3 colonnes
- 960 px et plus : hero sur deux colonnes, cartes méthode en mosaïque
- 1100 px et plus : navigation complète, timeline horizontale

## Mise en ligne

Le site est 100 % statique : dépose le dossier tel quel sur Netlify, Vercel ou GitHub Pages. Aucune commande de build.
