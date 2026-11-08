# ReSlot et SOC — lecteur commun

Les deux anciens lecteurs ont été remplacés par `WorkflowPlayer`, le même composant React Flow / Motion que les autres projets. Le nouveau rendu comprend l’introduction contextuelle, les cartes illustrées, le suivi automatique de caméra, les particules, les détails et les commandes communes.

- `ReslotWorkflow.tsx` : créneau, liste d’attente, offre refusée ou expirée, seconde offre, supervision, accord humain et confirmation. Scénario typé : `createReslotJourney` dans `scenario.ts`. Durée : **70 secondes**.
- `SocWorkflow.tsx` : journaux synthétiques, normalisation, triage, preuves, hypothèse de faux positif, rapport et choix de l’analyste. Scénario typé : `socJourney` dans `soc-scenario.ts`. Durée : **67 secondes**.

Les durées incluent une introduction de trois secondes avant les étapes conservées du scénario. Les anciens exports de données restent disponibles pour compatibilité.

Les exports par défaut incluent `ReactFlowProvider` ; les exports nommés se placent sous un fournisseur existant. Le contrôle « Première offre » conserve les variantes Refus / Expiration. Les boutons SOC Classer / Approfondir / Escalader expriment un choix local de simulation ; ils ne déclenchent aucune action extérieure. Le rejeu SOC efface ce choix.

La mise en page du portfolio conserve un iframe sans cadre extérieur pour chaque projet et mesure l’espace disponible afin de garder les commandes au-dessus du pied de page. Les messages de visibilité existants `reslot-visibility` et `soc-visibility` restent compatibles. Le mouvement réduit désactive l’autoplay initial et les transitions.

Vérifications :

```sh
node --test tests/journeys-scenario.mjs
node tests/journeys-browser.mjs --quick
node tests/journeys-browser.mjs
```

Le dernier test joue intégralement les deux scénarios à 1,5× dans Edge sous Windows. Les anciens points d’entrée de tests navigateur SOC / ReSlot délèguent au nouveau test. Les noms, événements, offres et données restent fictifs ; aucun message, réservation, blocage ou confinement réel n’a lieu.
