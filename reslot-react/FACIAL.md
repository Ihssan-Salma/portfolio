# Expressions faciales — une catégorie, pas une émotion

Le composant React anime un parcours de **70 secondes**, avec 3 secondes de contexte, dans la fiche « Reconnaissance d’expressions » du portfolio.

Lien direct : `http://127.0.0.1:4174/reslot-react/dist/index.html?project=facial`.

```tsx
import FacialApp from './src/FacialWorkflow';

export default function Demo() {
  return <FacialApp />;
}
```

L’export par défaut fournit `ReactFlowProvider`. L’export nommé `FacialWorkflow` s’utilise sous un fournisseur existant. Son dictionnaire `copy` traduit les commandes ; `facial-scenario.ts` regroupe les textes du parcours, les classes et les données synthétiques. `WorkflowPlayer.tsx` gère la lecture, les contrôles, la caméra, les particules et l’accessibilité. Le prop `renderVisual` ajoute les visualisations spécifiques sans dupliquer le lecteur.

## Parcours et visuels

Un visage vectoriel SVG représente une trame synthétique. OpenCV est le repère de détection ; un recadrage et une préparation en niveaux de gris précèdent le CNN TensorFlow / Keras entraîné sur FER2013. Les cartes montrent la région détectée, la préparation, un CNN conceptuel, sept barres de scores, un seuil, la surimpression et le lissage temporel.

Les scores de F-042 privilégient la classe « joie » à 64 %. F-043 atteint seulement 22 % : la surimpression affiche **Indéterminé**, sans catégorie. Le seuil de 45 % est choisi pour la démonstration ; ce n’est ni un seuil calibré ni une performance observée. Un score de classe n’est pas une mesure de fiabilité ou une probabilité d’émotion intérieure.

Une nouvelle séquence F-044 à F-048 utilise une moyenne exponentielle de coefficient 0,35 sur les sept scores. L’argmax brut alterne joie / surprise ; le lissage conserve joie et produit un dernier score d’environ 59 %. Ces résultats sont calculés à partir des tableaux synthétiques, pas tirés d’une vidéo réelle. Le seuil est contrôlé après lissage. Le lissage ne doit pas transformer une distribution incertaine en étiquette définitive.

La fin passe à l’évaluation hors ligne : F1 par classe et matrice de confusion conceptuelle. La diagonale représente les accords, les autres cases les désaccords. Aucune intensité de cellule ne représente un nombre d’exemples : le schéma ne contient aucune mesure. Aucun F1, exactitude ou résultat de déploiement n’est inventé.

## Données et limites

Aucun accès caméra, aucune identification, aucun envoi de trame, aucune exécution de modèle et aucun service métier externe. Les visages sont dessinés, les scores sont déterministes et le parcours décrit un processus produit illustratif plutôt que la complétude du dépôt. Une expression visible ne constitue pas une lecture fiable de l’état émotionnel interne.

Le lecteur démarre automatiquement lorsqu’il est visible, se suspend hors écran et reste initialement en pause avec `prefers-reduced-motion`. La navigation temporelle, les détails au clic, le rejeu, les vitesses et les vues de caméra suivent les autres animations du portfolio. Le parent peut émettre `{type:'facial-visibility', visible:boolean}` depuis la même origine ; le lecteur signale `facial-ready`.

## Vérifications locales

Depuis `reslot-react` : `npm run build`.

Depuis la racine, avec le serveur sur le port 4174 :

```sh
node --test tests/facial-scenario.mjs
node tests/facial-browser.mjs
```

Le test navigateur Edge vérifie notamment le parcours complet à 1,5×, les sept scores, l’abstention, le lissage, la surimpression, la matrice non chiffrée, les commandes, le mobile et le mouvement réduit. Les captures sont conservées dans un dossier temporaire.
