# Smart Home IoT — simulation réseau

Animation React de **68 secondes**, dont 3 secondes de contexte, disponible dans la nouvelle fiche « Smart Home IoT » du portfolio.

Lien direct : `http://127.0.0.1:4174/reslot-react/dist/index.html?project=iot`.

```tsx
import IotApp from './src/IotWorkflow';

export default function Demo() {
  return <IotApp />;
}
```

L’export par défaut fournit `ReactFlowProvider`. L’export nommé `IotWorkflow` fonctionne sous un fournisseur existant et accepte `copy` pour traduire les commandes. `iot-scenario.ts` contient les étapes, les textes, les données et la fonction pure `homeStateAt`. Les petits visuels SVG et les états d’interface sont dans `IotWorkflow.tsx`. Le lecteur commun gère autoplay, pause, rejeu, étape suivante, vitesses, progression, caméra, détails et mouvement réduit.

## Chronologie

Le résident ouvre l’interface de gestion et s’authentifie en HTTPS. La requête traverse le routeur et la passerelle simulés. Il consulte une valeur fixe de 21 °C et une lumière Éteinte, puis demande l’allumage par C-017. Le dispositif applique son état avant de répondre ; le tableau attend l’accusé avant d’afficher Allumée.

L’événement E-009 signale ensuite une porte ouverte. Une règle crée une notification, puis le résident la consulte. La tentative d’extinction d’un invité est refusée à la frontière de gestion, sans être relayée à la passerelle ni modifier la lumière.

Les exemples sont déterministes. La notification s’affiche avant d’être marquée consultée ; la valeur de température ne prétend pas provenir d’un foyer. La simulation ne déverrouille pas de porte et n’exécute aucune autre action cachée.

## Périmètre

**Cisco Packet Tracer** est le contexte de simulation représenté ; ce lecteur ne lance pas Packet Tracer et ne contacte aucun équipement. HTTPS décrit le trafic de gestion, pas nécessairement chaque liaison entre objets. HTTPS et autorisation sont distincts : un transport sécurisé n’accorde pas le droit de contrôler une lumière.

Aucune caméra, application mobile réelle, carte physique, messagerie ou infrastructure externe n’est ajoutée. Le scénario n’est pas un inventaire de fonctionnalités déjà implémentées. Aucun lien de dépôt ou statut de déploiement n’est inventé pour la nouvelle fiche.

Le parent peut émettre `{type:'iot-visibility', visible:boolean}` depuis la même origine ; le lecteur répond par `iot-ready`. La lecture est suspendue quand la fiche est masquée. Le mode autonome démarre directement ; le mouvement réduit désactive l’autoplay initial et les transitions.

## Vérifications

Depuis `reslot-react` : `npm run build`.

Depuis la racine, avec le serveur de portfolio sur le port 4174 :

```sh
node --test tests/iot-scenario.mjs
node tests/iot-browser.mjs
```

Le test Edge vérifie la lecture entière à 1,5×, la séparation demande/confirmation, les notifications, le refus sans effet, les commandes, le cadrage mobile et le mouvement réduit. Les captures sont enregistrées dans un dossier temporaire.
