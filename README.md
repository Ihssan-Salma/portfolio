# Salma Ihssan — Portfolio

Portfolio personnel en français et en anglais : projets, expériences, certifications, formation et engagements.

- Interface en noir, blanc et violet `#cc00ff`.
- Animations interactives avec React, TypeScript, React Flow (`@xyflow/react`) et Motion.
- Exemples entièrement fictifs et déterministes, exécutés dans le navigateur, sans backend.
- Lecture, filtres, détails, caméra automatique, adaptation mobile et mouvement réduit.

## Prévisualiser

Depuis la racine :

```sh
python -m http.server 4174 --bind 127.0.0.1
```

Ouvrir [http://127.0.0.1:4174/](http://127.0.0.1:4174/).

## Compiler les animations

Les animations compilées sont conservées dans `reslot-react/dist/` pour que le site fonctionne directement sur un hébergement statique, notamment GitHub Pages. Après modification des composants React :

```sh
cd reslot-react
npm ci
npm run build
```

Inclure le dossier `reslot-react/dist/` mis à jour dans le même commit que les sources. Le serveur de prévisualisation doit servir la racine du portfolio.

## Vérifier

Depuis la racine, avec Node.js :

```sh
node --test tests/site-check.mjs tests/story-check.mjs tests/*-scenario.mjs
```

Les tests navigateur dans `tests/` utilisent Microsoft Edge sous Windows et le serveur local au port 4174. Leurs captures sont enregistrées dans un dossier temporaire. Par exemple :

```sh
node tests/dark-review.mjs --no-screenshots
node tests/traffic-browser.mjs --quick --no-screenshots
```

## Publication

Le site est servi depuis la racine de la branche `main`. Le fichier `.nojekyll` permet de servir directement les fichiers statiques. Les dépendances `node_modules/` et les fichiers temporaires locaux sont exclus par `.gitignore`.

## Police et ressources

La famille Normal est configurée dans [fonts.css](./fonts.css). Son fichier n’est pas inclus : une police Normal installée localement est utilisée si disponible ; sinon le navigateur utilise Trebuchet MS, Arial ou une police sans empattement. L’intégration exacte attend le fichier de police fourni par sa titulaire.

Les logos et illustrations sont stockés dans [assets/](./assets/). Les références figurent dans [STORY-SOURCES.md](./STORY-SOURCES.md), [ENGAGEMENTS-SOURCES.md](./ENGAGEMENTS-SOURCES.md) et les fichiers de sources des logos dans `assets/`.
