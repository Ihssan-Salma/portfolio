# Smart Banking — réclamations fictives

Le parcours React dure **68 secondes**, dont 3 secondes de contexte. Il remplace le schéma de la fiche Attijariwafa bank dans **Expérience**, en conservant son logo et les informations de stage.

Lien direct : `http://127.0.0.1:4174/reslot-react/dist/index.html?project=banking`.

```tsx
import BankingApp from './src/BankingWorkflow';

export default function Demo() {
  return <BankingApp />;
}
```

L’export par défaut fournit `ReactFlowProvider`. L’export nommé `BankingWorkflow` se place sous un fournisseur existant. Il accepte `copy` pour traduire les commandes. `banking-scenario.ts` regroupe les textes, les types d’extraction, le masquage, les extraits fictifs et les règles. `BankingWorkflow.tsx` fournit les visuels spécifiques, tandis que le lecteur commun anime les nœuds, les particules, les contrôles, la caméra et les détails.

## Ordre du traitement

1. Une réclamation entièrement fictive contient **Amal Exemple** et **DEMO-CPT-0042**.
2. FastAPI valide la requête et RabbitMQ découple l’admission du worker. `202 Accepté` n’est pas un résultat d’analyse.
3. Le worker masque le nom et le compte avant LangGraph, RAG et Llama 3. Le masquage codé remplace les deux valeurs connues de cet exemple ; il ne remplace pas une installation réelle de Presidio / spaCy.
4. ChromaDB représente la récupération d’une politique et d’un précédent fictifs. **POL-DEMO-01** et **CAS-DEMO-07** ne sont pas des documents de la banque.
5. Llama 3 est représenté par une extraction structurée, accompagnée de citations. L’insatisfaction est exprimée dans le texte ; la contestation reste une déclaration à vérifier.
6. Une fonction déterministe applique **R-DEMO-01** : déclaration d’opération non autorisée ET demande de blocage → P1 et alerte à relire. Sinon la règle illustrative renvoie P2 ou P3. Une éventuelle priorité proposée par un modèle ne participe pas au calcul.
7. Le résultat masqué est persisté, l’alerte est proposée à une revue humaine, puis le worker acquitte le message. Les vues Prometheus / Grafana montrent des états qualitatifs, sans chiffres de production ou d’impact métier.

## Limites explicites

Ce récit décrit un processus produit illustratif, pas l’inventaire des fonctions réalisées pendant le stage. Aucun modèle, service de banque, file distante ou base réelle n’est appelé. Les noms, comptes, documents, règles et résultats sont inventés. Aucun envoi d’alerte réel, blocage, remboursement ou décision sur un compte n’a lieu. La fin conserve **À relire** pour distinguer le traitement terminé d’une décision humaine non encore prise.

Le lecteur démarre quand la fiche est visible, se suspend lorsqu’un autre stage est choisi et respecte le mouvement réduit. Le parent peut envoyer `{type:'banking-visibility', visible:boolean}` depuis la même origine ; le lecteur signale `banking-ready`.

## Vérifications locales

Depuis `reslot-react` : `npm run build`.

Depuis la racine, avec le serveur sur le port 4174 :

```sh
node --test tests/banking-scenario.mjs
node tests/banking-browser.mjs
```

Les tests portent sur le masquage avant IA, le découplage API/worker, les règles, la priorité indépendante du modèle, la persistance avant acquittement, la lecture complète à 1,5×, les contrôles, l’affichage mobile et le mouvement réduit. Les captures navigateur sont enregistrées dans un répertoire temporaire.
