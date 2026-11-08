# Autoroutes du Maroc — Traffic Analytics

Le parcours React dure **63 secondes**, dont trois secondes de contexte. Il anime l’import, le nettoyage, le modèle en étoile, les mesures DAX et un tableau de bord local dont les filtres modifient réellement les graphiques.

Le portfolio l’affiche dans **Expérience → Autoroutes du Maroc**. Lien autonome : `http://127.0.0.1:4174/reslot-react/dist/index.html?project=traffic`. Les vues intégrée et autonome utilisent la palette actuelle du portfolio : noir, blanc et violet `#cc00ff`. Les valeurs historiques `paper` et `dark` restent acceptées pour la compatibilité du composant.

```tsx
import TrafficApp from './src/TrafficWorkflow';

export default function Demo() {
  return <TrafficApp />;
}
```

L’export par défaut inclut `ReactFlowProvider`. L’export nommé `TrafficWorkflow` se place sous un fournisseur existant et accepte `appearance="paper" | "dark"`, `copy` pour les commandes et `messages` pour les libellés visuels. `traffic-messages.ts` exporte le type `TrafficMessages` et le dictionnaire `trafficMessagesFr`, remplaçable par une autre traduction. Les étapes et leurs textes sont séparés dans `traffic-scenario.ts`. Le lecteur commun fournit la lecture, les vitesses, les détails, la progression, les jetons et la caméra.

Les données sont entièrement synthétiques : deux tronçons fictifs, six créneaux et une journée comparable en juin pour chacune des années 2022, 2023 et 2024. Les volumes affichés sont les sommes de ces **extraits**, jamais des statistiques annuelles d’Autoroutes du Maroc. Les observations absentes restent absentes ; les anomalies et doublons sont isolés sans supposer leur cause. L’année 2022 n’a pas de comparaison N−1.

Le tableau de bord illustre Power BI et DAX avec des calculs locaux déterministes. Aucun service externe, accès Power BI, backend, donnée personnelle, flux routier en direct ou modèle prédictif n’intervient. Un pic de comptage fournit un constat à approfondir ; il ne prouve pas une congestion et ne prédit pas le trafic.

Les filtres restent accessibles pendant la lecture. La démonstration change automatiquement de sélection jusqu’à la première action manuelle ; ensuite les choix de l’utilisateur sont conservés, y compris lors de Rejouer. Le lecteur se suspend lorsqu’une autre expérience est affichée. Le parent peut envoyer `{type:'traffic-visibility', visible:boolean}` depuis la même origine ; le lecteur signale `traffic-ready`. Le mouvement réduit démarre en pause et désactive les animations continues.

Pour compiler, lancer `npm run build` depuis `reslot-react`. Depuis la racine, avec le serveur local sur le port 4174 :

```sh
node --test tests/traffic-scenario.mjs
node tests/traffic-browser.mjs
```

Le test navigateur vérifie la lecture complète à 1,5×, les filtres et les calculs affichés, la suspension, les détails, la fin propre, la caméra, les formats mobiles de 390 et 320 pixels, le mouvement réduit et les exceptions JavaScript. `--quick` remplace seulement l’attente de lecture complète par un déplacement à la fin. `--no-screenshots` conserve toutes les assertions et désactive uniquement les captures. Les captures sont enregistrées dans un dossier temporaire ; `PORTFOLIO_URL` permet de changer l’adresse du serveur.
