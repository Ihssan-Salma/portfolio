# Agile Tracker — un sprint, trois services

Le lecteur React joue un scénario déterministe de **69 secondes**, dont 3 secondes de contexte. Il est intégré à la fiche Agile Tracker du portfolio et accessible directement :

`http://127.0.0.1:4174/reslot-react/dist/index.html?project=agile`

## Réutilisation

```tsx
import AgileApp from './src/AgileWorkflow';

export default function Demo() {
  return <AgileApp />;
}
```

L’export par défaut fournit `ReactFlowProvider`. L’export nommé `AgileWorkflow` s’utilise sous un fournisseur existant. Il accepte un dictionnaire `copy` pour traduire les commandes. Les textes et contrats du parcours sont réunis dans `src/agile-scenario.ts`, séparés des identifiants techniques. `src/workflow-scenario.ts` définit les types communs ; `src/WorkflowPlayer.tsx` fournit la lecture, la caméra, les particules, les détails, les limites visuelles de services et les commandes partagées avec eGrading.

## Le parcours illustré

Ariane crée P-042 et affecte U-17 / U-23. Identité vérifie l’acteur et les rôles. Projets ouvre S-07 ; Tâches crée T-101, T-102 et T-103. U-17 démarre T-101 et déclare 90 minutes. Les trois services possèdent chacun leur base PostgreSQL ; les contrats HTTP échangent des références, sans accès SQL entre services.

Lors de l’agrégation, seul l’enrichissement facultatif des noms par Identité dépasse son budget fictif de deux secondes. Les autorisations déjà vérifiées restent requises. Le tableau affiche les réponses disponibles : zéro tâche terminée, une en cours, deux à faire et 90 minutes déclarées. Les identifiants remplacent les noms indisponibles, avec un état **Partiel** explicite. Aucun résultat manquant n’est présenté comme zéro.

Docker Compose désigne l’orchestration locale illustrée. Le lecteur ne démarre aucun conteneur, n’appelle aucun service métier et ne documente pas la complétude du dépôt. Les contrats, rôles, dates, temps, noms et identifiants sont fictifs. Aucune infrastructure de production, découverte de services ou messagerie n’est supposée.

La lecture s’arrête quand la fiche est masquée. Le parent peut envoyer `{type:'agile-visibility', visible:boolean}` depuis la même origine ; le lecteur émet `agile-ready`. Le mode autonome démarre directement. Le mouvement réduit désactive l’autoplay initial et les animations, y compris lors d’un changement de préférence en cours de lecture.

## Vérifications

Depuis `reslot-react` : `npm run build`.

Depuis la racine, avec le portfolio servi sur le port 4174 :

```sh
node --test tests/agile-scenario.mjs
node tests/agile-browser.mjs
```

Le test navigateur utilise Edge sous Windows. Il vérifie le parcours intégral à 1,5×, la pause, le rejeu, les étapes, le curseur de progression, les détails sans interruption, le délai dépassé, l’état partiel, le cadrage à 390 / 320 px et le mouvement réduit. Les captures sont enregistrées dans un répertoire temporaire.
