# THE 20 — Landing page

Site statique (HTML / CSS / JS vanilla, aucun framework, aucun build) pour la landing page de THE 20, dont l'unique objectif est de générer des réservations d'appel découverte.

## Lancer le site en local

Aucune installation n'est nécessaire.

- **Le plus simple** : double-clique sur `index.html`, il s'ouvre dans ton navigateur.
- **Recommandé** (évite quelques limitations liées à l'ouverture en `file://`) : lance un petit serveur local depuis ce dossier, par exemple avec `npx serve` ou l'extension VS Code "Live Server", puis ouvre l'URL indiquée (ex. `http://localhost:3000`).

## Structure des fichiers

```
index.html          → toutes les sections de la page, dans l'ordre d'affichage
css/style.css        → couleurs, polices, mise en page, responsive
js/script.js          → menu mobile, header sticky, animations, formulaire
assets/logo.svg        → logo THE 20 (jauge Pareto)
assets/favicon.svg      → version carrée simplifiée du logo, utilisée comme favicon
```

## Où modifier les textes

Tout le texte est directement dans `index.html`, section par section (chaque section est annoncée par un commentaire `<!-- ... -->`, ex. `<!-- HERO -->`, `<!-- LA MÉTHODE -->`, etc.). Il suffit de chercher le texte à changer et de le remplacer dans la balise correspondante.

Les zones encore incomplètes sont clairement identifiées :
- `[À REMPLACER : ...]` dans le texte (ex. section "À propos", témoignages).
- Les liens `Mentions légales [à compléter]`, `Politique de confidentialité [à compléter]` dans le footer.
- L'email `contact@the20.fr [à adapter]`.

## Où modifier les couleurs

Toutes les couleurs de marque sont définies une seule fois, en haut de `css/style.css`, dans le bloc `:root` :

```css
:root {
  --vert-foret: #2F4A3D;   /* couleur primaire */
  --terracotta: #C1652F;   /* accent, CTA */
  --anthracite: #26231F;   /* texte / neutre foncé */
  --sable: #F1EAD9;        /* fond clair / neutre clair */
  --ocre: #C9A227;         /* support, usage ponctuel */
}
```

Changer une valeur ici met à jour toute la page automatiquement, puisque le reste du fichier CSS utilise ces variables (`var(--terracotta)`, etc.) plutôt que des couleurs écrites en dur.

## Où modifier les polices

Dans `index.html`, l'appel Google Fonts se trouve dans le `<head>` :

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

Les noms de police sont ensuite définis dans `css/style.css` (`--font-titres` pour Space Grotesk, `--font-corps` pour Inter). Si les fonts ne chargent pas (pas de connexion), le site retombe automatiquement sur une police système (`sans-serif`).

## Où brancher le vrai formulaire de prise de rendez-vous

Le formulaire de contact (`#contact-form` dans `index.html`) n'a **pas de backend pour l'instant**. Il valide juste les champs (prénom requis, email au bon format) et affiche un message de confirmation simulé.

Pour connecter un vrai service, ouvre `js/script.js` et repère le commentaire :

```js
// TODO Maxime : brancher ici Calendly, Formspree ou un webhook pour
// recevoir réellement les demandes (...)
```

Options possibles :
1. **Calendly** : remplacer le formulaire par un widget Calendly embarqué (iframe), ou déclencher l'ouverture d'un popup Calendly au clic sur le bouton.
2. **Formspree** (ou équivalent : Netlify Forms, Getform...) : envoyer les données du formulaire avec `fetch()` vers l'URL fournie par le service.
3. **Webhook personnel** : envoyer les données vers ton propre backend / automatisation (Zapier, Make, n8n...).

## Où remplacer les images

Deux zones sont prévues pour de vraies photos, actuellement affichées comme des placeholders visuels avec un texte explicite :
- Section Hero : `<!-- Remplacer par une vraie photo de Maxime en séance -->`
- Section À propos : `<!-- Remplacer par une vraie photo portrait de Maxime -->`

Dans chaque cas, remplace le `<div class="img-placeholder">...</div>` par une balise `<img src="assets/ton-image.jpg" alt="description de l'image">`, et dépose le fichier image dans le dossier `assets/`.

## Déploiement

Le site est 100 % statique : il suffit de déposer (glisser-déposer) l'ensemble du dossier sur Netlify, Vercel ou GitHub Pages. Aucune commande de build n'est nécessaire.

## Accessibilité et performance — ce qui est déjà en place

- HTML sémantique (`header`, `main`, `section`, `footer`, `nav`).
- Contrastes de texte vérifiés sur la palette de marque.
- Focus clavier visible sur tous les éléments interactifs.
- Menu mobile accessible au clavier (`aria-expanded`, fermeture avec Échap).
- Animations d'apparition désactivées si l'utilisateur a activé "réduire les animations" (`prefers-reduced-motion`).
- Aucune dépendance externe autre que Google Fonts (pas de framework CSS/JS). 
