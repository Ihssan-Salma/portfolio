import type {WorkflowDefinition,WorkflowStage,WorkflowScene,WorkflowCopy} from './workflow-scenario';

// Deterministic fictional state. No physical devices, household data or network calls.
export function homeStateAt(time:number){return {
 deviceLight:time>=38?'Allumée':'Éteinte',
 dashboardLight:time>=44?'Allumée':'Éteinte',
 pending:time>=28&&time<44,
 acknowledged:time>=40,
 door:time>=48?'Ouverte':'Fermée',
 notified:time>=52,
 reviewed:time>=58,
 denied:time>=60,
 temperature:21,
};}
export const iotStages:WorkflowStage[]=[
 {id:'dashboard',label:'Tableau du résident',role:'Interface de contrôle simulée',detail:'Un résident fictif ouvre le contrôle de la maison, consulte la pièce et demande « Allumer la lumière du salon ». Le tableau n’affiche Allumée qu’après le retour d’état de la commande C-017. Aucun site ou appareil domestique réel n’est contacté.'},
 {id:'https',label:'Gestion sécurisée',role:'HTTPS · gestion des accès',detail:'La gestion est représentée en HTTPS dans une simulation réseau Cisco Packet Tracer. L’accès résident est autorisé ; l’invité n’a pas le droit de piloter la lumière. HTTPS protège le transport de gestion, mais ne remplace pas l’autorisation et ne signifie pas que chaque liaison d’objet utilise HTTPS.'},
 {id:'router',label:'Routeur de la maison',role:'Réseau local / Wi-Fi simulé',detail:'La requête de gestion traverse le réseau domestique illustré. Le routeur et la liaison Wi-Fi sont des éléments du scénario Packet Tracer, sans point d’accès ou équipement physique manipulé par ce lecteur.'},
 {id:'gateway',label:'Passerelle IoT',role:'Relais des commandes autorisées',detail:'Associe la commande C-017 à la lumière du salon et relaie l’état du dispositif. Les flèches d’objets sont conceptuelles : aucun protocole supplémentaire, matériel physique ou backend externe n’est supposé.'},
 {id:'sensor',label:'Condition de la pièce',role:'Capteur de démonstration',detail:'La valeur fixe de 21 °C sert uniquement d’exemple de condition dans une pièce. Ce n’est pas une mesure d’un foyer réel. La consultation ne déclenche aucune action automatique sur le chauffage ou la lumière.'},
 {id:'light',label:'Lumière du salon',role:'Objet connecté simulé',detail:'État initial Éteinte. La commande illustrée C-017 atteint la lumière, qui applique Allumée avant de renvoyer son accusé. L’interface conserve son ancien état tant qu’elle attend le retour, pour distinguer demande et confirmation.'},
 {id:'ack',label:'Accusé & état du dispositif',role:'Confirmation de C-017',detail:'Le retour associe l’identifiant C-017 et l’état Allumée. Le tableau met ensuite à jour son affichage. Une demande envoyée n’est pas présentée comme une réussite avant cette confirmation.'},
 {id:'door',label:'Indicateur de porte',role:'Événement d’état simulé',detail:'Un événement fictif E-009 indique une porte ouverte. Il représente un changement d’état observé dans le scénario, pas une commande de déverrouillage ni des données sur les habitudes d’une personne réelle.'},
 {id:'rules',label:'Événements & règles',role:'Notifier, puis faire relire',detail:'Règle illustrative : événement porte ouverte → notification au résident. Celui-ci consulte la notification. Cette règle ne déverrouille rien et ne provoque aucune action matérielle cachée.'},
];
export const iotScenes:WorkflowScene[]=[
 {duration:3,chapter:'Le contexte',title:'Une maison connectée, entièrement simulée',output:'Cisco Packet Tracer · gestion HTTPS · aucune donnée de foyer réel'},
 {node:'dashboard',duration:4,chapter:'01 · Ouvrir',title:'Le résident ouvre le tableau de contrôle',output:'Maison de démonstration · salon · session à authentifier'},
 {from:'dashboard',node:'https',duration:5,chapter:'01 · Authentifier',title:'L’accès résident est authentifié en HTTPS',contract:'HTTPS · interface de gestion',output:'Résident autorisé · consultation et commande permises'},
 {from:'https',node:'router',duration:4,chapter:'02 · Acheminer',title:'La requête traverse le réseau de la maison',contract:'Trafic de gestion HTTPS',output:'Routeur / Wi-Fi simulé · destination : passerelle locale'},
 {from:'router',node:'gateway',duration:4,chapter:'02 · Relayer',title:'La passerelle reçoit la demande autorisée',output:'Session résident reconnue · état des objets disponible'},
 {from:'gateway',node:'sensor',duration:4,chapter:'03 · Consulter',title:'Le résident consulte la condition du salon',output:'21 °C · valeur synthétique de démonstration'},
 {from:'gateway',node:'light',duration:4,chapter:'03 · Vérifier',title:'La lumière est initialement éteinte',output:'Lumière du salon : Éteinte · porte : Fermée'},
 {from:'light',node:'dashboard',duration:4,chapter:'04 · Demander',title:'Le résident demande d’allumer la lumière',output:'« Allumer la lumière du salon » · C-017 en attente'},
 {from:'dashboard',node:'gateway',duration:4,chapter:'04 · Transmettre',title:'La commande autorisée atteint la passerelle',contract:'C-017 · commande autorisée',output:'Cible : lumière du salon · état demandé : Allumée'},
 {from:'gateway',node:'light',duration:4,chapter:'04 · Appliquer',title:'L’objet simulé applique le nouvel état',output:'C-017 reçue · Éteinte → Allumée · retour en préparation'},
 {from:'light',node:'ack',duration:4,chapter:'05 · Confirmer',title:'Le dispositif confirme la commande C-017',contract:'C-017 · accusé + état',output:'Accusé reçu · lumière du salon : Allumée'},
 {from:'ack',node:'dashboard',duration:4,chapter:'05 · Actualiser',title:'Le tableau affiche l’état confirmé',output:'Éteinte → Allumée · C-017 confirmée, attente terminée'},
 {from:'gateway',node:'door',duration:4,chapter:'06 · Observer',title:'Un événement indique une porte ouverte',output:'E-009 · porte : Fermée → Ouverte · événement synthétique'},
 {from:'door',node:'rules',duration:4,chapter:'06 · Notifier',title:'Une règle prépare une notification visible',output:'Si porte ouverte → notifier le résident · aucune autre action'},
 {from:'rules',node:'dashboard',duration:4,chapter:'06 · Consulter',title:'Le résident relit la notification de porte',output:'E-009 consulté · porte Ouverte · lumière toujours Allumée'},
 {from:'dashboard',node:'https',duration:4,chapter:'07 · Refuser',issue:true,title:'Une tentative de contrôle non autorisée est refusée',contract:'HTTPS · contrôle d’autorisation',output:'Invité · demande d’extinction refusée · aucune commande relayée'},
 {from:'https',node:'dashboard',duration:4,chapter:'Parcours terminé',title:'Le contrôle reste réservé au résident autorisé',output:'Lumière Allumée · notification consultée · accès invité refusé'},
];
export const iotStarts=iotScenes.map((_,i)=>iotScenes.slice(0,i).reduce((sum,scene)=>sum+scene.duration,0));
export const iotDuration=iotScenes.reduce((sum,scene)=>sum+scene.duration,0);
export const iotCopy:WorkflowCopy={title:'Smart Home IoT',simulation:'Parcours illustratif · données fictives',play:'Lire',pause:'Pause',replay:'Rejouer',next:'Étape suivante',speed:'Vitesse',follow:'Suivre le parcours',overview:'Vue complète',progress:'Progression de la maison connectée simulée',close:'Fermer les détails',details:'Détails du composant',waiting:'À venir',receiving:'Réception',processing:'Traitement',done:'Terminé',blocked:'Refusé',course:'Maison de démonstration · réseau simulé',assignment:'Du contrôle à la confirmation',intro:'Consulter le salon, allumer sa lumière et garder les accès sous contrôle.',deadline:'Cisco Packet Tracer · gestion en HTTPS · aucun appareil réel',roles:['Résident','Passerelle IoT','Objets simulés'],notice:'Simulation Cisco Packet Tracer · aucun appareil ni foyer réel contacté.'};
export const iotScenario:WorkflowDefinition={id:'iot',stages:iotStages,scenes:iotScenes,copy:iotCopy,subtitle:'une maison en simulation',introLabel:'Contexte de la maison simulée',environment:'Cisco Packet Tracer · HTTPS pour la gestion · objets illustratifs',cardSize:{width:270,height:280}};
