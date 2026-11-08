# eGrading — parcours pédagogique

Le lecteur React joue un scénario synthétique de 63 secondes, dont 3 secondes de contexte. Il est accessible dans le portfolio, onglet **Plateforme eGrading**, ou directement à l’adresse :

`http://127.0.0.1:4174/reslot-react/dist/index.html?project=egrading`

## Réutiliser le composant

```tsx
import EgradingApp from './src/EgradingWorkflow';

export default function Demo() {
  return <EgradingApp />;
}
```

L’export par défaut contient le `ReactFlowProvider`. L’export nommé `EgradingWorkflow` permet une intégration sous un fournisseur existant. Le lecteur occupe la hauteur de son viewport ; dans le portfolio, un iframe lui donne une surface indépendante.

`src/egrading-scenario.ts` contient les étapes typées, les sorties, la chronologie et le dictionnaire français. Le prop `copy` permet de traduire les commandes ; traduire les chaînes du scénario dans le même module pour une autre langue. Les identifiants techniques restent indépendants du texte affiché.

La lecture démarre automatiquement lorsque la fiche est visible. Le parent peut envoyer `{type: 'egrading-visibility', visible: boolean}` depuis la même origine pour suspendre la lecture hors écran. Le lecteur signale sa disponibilité avec `egrading-ready`. En mode autonome il démarre directement ; avec une préférence de mouvement réduit, il reste en pause et désactive les mouvements.

Les commandes permettent lecture, pause, reprise, rejeu, étape suivante, vitesse, déplacement dans la chronologie et bascule entre suivi du parcours et vue complète. Cliquer un composant ouvre ses détails sans arrêter la lecture. Échap ferme le panneau et restitue le focus.

## Portée du scénario

Camille publie D-204 pour INFO-3 ; Lina remet S-018, Camille corrige et attribue 16/20. Une requête de Noé est refusée, puis Lina consulte son propre résultat. Ces noms et données sont fictifs. Spring Boot, React, MySQL et MongoDB sont des repères d’architecture ; les rôles de stockage sont plausibles et illustratifs. Cette démonstration ne décrit pas la complétude du dépôt, ne corrige pas automatiquement les copies et n’appelle aucun service métier externe.

## Vérifications locales

Depuis `reslot-react` : `npm run build`.

Depuis la racine, avec le serveur de portfolio sur le port 4174 :

```sh
node --test tests/egrading-scenario.mjs
node tests/egrading-browser.mjs
```

Le test navigateur utilise Edge sous Windows et des captures dans un dossier temporaire. Il vérifie la lecture entière à 1,5×, les commandes, la branche 403, la fin, le rejeu, le panneau de détails, le cadrage mobile et le mouvement réduit.
