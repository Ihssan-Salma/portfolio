import type {WorkflowDefinition,WorkflowStage,WorkflowScene,WorkflowCopy} from './workflow-scenario';

export const fictionalCustomer={name:'Amal Exemple',account:'DEMO-CPT-0042'};
export const rawComplaint='Je suis Amal Exemple, compte DEMO-CPT-0042. Je suis mécontente : je conteste une opération que je n’ai pas autorisée. Merci de bloquer ma carte.';
// Exact replacements for this deterministic example, not a general PII detector.
export function maskComplaint(text:string){return text.replaceAll(fictionalCustomer.name,'[PERSONNE_01]').replaceAll(fictionalCustomer.account,'[COMPTE_01]');}
export const maskedComplaint=maskComplaint(rawComplaint);
export const fictionalPassages=[
 {id:'POL-DEMO-01',label:'Politique fictive',text:'Contestation déclarée d’une opération non autorisée avec demande de blocage : proposer une revue urgente à un analyste.'},
 {id:'CAS-DEMO-07',label:'Précédent fictif anonymisé',text:'[PERSONNE_X] conteste une opération ; le dossier est orienté vers un analyste, sans décision automatique sur le compte.'},
];
export function prepareModelPayload(text:string){
 const complaint=maskComplaint(text);
 if(complaint.includes(fictionalCustomer.name)||complaint.includes(fictionalCustomer.account))throw Error('Masquage incomplet : accès au modèle interdit');
 return {complaint,passages:fictionalPassages};
}
export type BankExtraction={theme:string;summary:string;unauthorizedOperation:boolean;blockingRequested:boolean;dissatisfactionExpressed:boolean;evidence:string[]};
export const sampleExtraction:BankExtraction={theme:'Opération contestée',summary:'[PERSONNE_01] conteste une opération sur [COMPTE_01] et demande le blocage de sa carte.',unauthorizedOperation:true,blockingRequested:true,dissatisfactionExpressed:true,evidence:['« je n’ai pas autorisée »','« bloquer ma carte »','« Je suis mécontente »']};
export function validateExtraction(value:unknown):value is BankExtraction{
 if(!value||typeof value!=='object')return false;
 const data=value as Record<string,unknown>;
 return typeof data.theme==='string'&&!!data.theme&&typeof data.summary==='string'&&!!data.summary&&['unauthorizedOperation','blockingRequested','dissatisfactionExpressed'].every(key=>typeof data[key]==='boolean')&&Array.isArray(data.evidence)&&data.evidence.every(item=>typeof item==='string');
}
export function calculatePriority(data:BankExtraction){
 if(!validateExtraction(data))throw Error('Extraction invalide : revue requise');
 if(data.unauthorizedOperation&&data.blockingRequested)return {priority:'P1',urgent:true,rule:'R-DEMO-01',reason:'Opération non autorisée déclarée + demande de blocage',supervision:'Revue humaine requise'};
 return {priority:data.dissatisfactionExpressed?'P2':'P3',urgent:false,rule:'R-DEMO-02',reason:'Critères de revue urgente non réunis',supervision:'Traitement à superviser'};
}
export const samplePriority=calculatePriority(sampleExtraction);
export const bankingStages:WorkflowStage[]=[
 {id:'intake',label:'Réclamation entrante',role:'Client et compte fictifs',detail:'Amal Exemple et DEMO-CPT-0042 sont entièrement inventés. La réclamation déclare une opération non autorisée et demande un blocage. Le récit ne prouve pas une fraude et n’exécute aucune opération bancaire.'},
 {id:'api',label:'Réception FastAPI',role:'API · validation et admission',detail:'L’API illustre la validation du format et de l’identifiant C-042, puis la mise en file. Sa réponse 202 signifie accepté pour traitement, sans attendre le modèle. Aucune API réelle n’est appelée.'},
 {id:'queue',label:'File de messages',role:'RabbitMQ · API ≠ worker',detail:'Le message J-042 découple l’admission HTTP du traitement par le worker. Le visuel montre seulement une référence de dossier, pas le texte client dans les libellés. L’accusé du worker intervient après persistance du résultat dans le scénario.'},
 {id:'privacy',label:'Détection & masquage',role:'Worker · Presidio / spaCy',detail:'Le worker représente la détection puis le remplacement du nom et de l’identifiant avant LangGraph, RAG et Llama 3. La démonstration applique des remplacements exacts aux deux valeurs fictives connues ; elle ne garantit pas une détection universelle des données personnelles.'},
 {id:'graph',label:'Orchestration LangGraph',role:'Worker · contenu masqué uniquement',detail:'LangGraph organise ici la récupération de contexte, l’extraction et le passage aux règles. Le contenu fourni à cette partie du parcours est masqué. Le lecteur n’exécute pas de modèle ni de workflow distant.'},
 {id:'retrieval',label:'Contexte documentaire',role:'RAG / ChromaDB · corpus fictif',detail:'POL-DEMO-01 et CAS-DEMO-07 sont des textes inventés pour illustrer une politique et un précédent anonymisé. Ce ne sont pas des documents Attijariwafa bank ni une politique réelle. Leurs références accompagnent l’extraction pour rendre le contexte identifiable.'},
 {id:'llama',label:'Extraction structurée',role:'Llama 3 · schéma contrôlé',detail:'Sortie structurée synthétique : thème, résumé masqué, déclaration d’opération non autorisée, demande de blocage et citations justificatives. Le schéma ne confie aucune décision de priorité au modèle ; les indicateurs restent des déclarations à vérifier.'},
 {id:'signals',label:'Signaux et justification',role:'Insatisfaction / sensibilité',detail:'« Je suis mécontente » justifie une insatisfaction exprimée, sans inférence psychologique. La contestation d’opération et la demande de blocage constituent des signaux de sensibilité financière à vérifier. Les citations rendent ces signaux explicables.'},
 {id:'rules',label:'Priorité déterministe',role:'Règles métier de démonstration',detail:'R-DEMO-01 : opération non autorisée déclarée ET demande de blocage → P1 et alerte à relire. Sinon R-DEMO-02 : P2 si insatisfaction exprimée, P3 sinon. Ces règles sont fictives et ne décrivent pas une politique bancaire officielle. Le calcul ignore toute priorité proposée par un modèle.'},
 {id:'record',label:'Résultat enregistré',role:'PostgreSQL · dossier masqué',detail:'La persistance illustrée conserve C-042, le résumé masqué, les références du contexte, les signaux, la règle appliquée et la proposition P1. Aucun nom ou identifiant de compte brut n’est envoyé aux vues de suivi de cette démonstration.'},
 {id:'alert',label:'Alerte de revue urgente',role:'P1 justifiée · supervision',detail:'Une alerte interne est proposée pour la combinaison de critères de R-DEMO-01. Elle doit être relue par un analyste. Ce lecteur n’envoie aucun message et ne bloque ni carte ni compte.'},
 {id:'review',label:'File de revue humaine',role:'Analyste · décision à venir',detail:'Le dossier et ses éléments justificatifs attendent une relecture. La démonstration ne prétend pas qu’un analyste a validé la fraude, un blocage ou une compensation. Aucune décision bancaire n’est automatisée ici.'},
 {id:'monitor',label:'Suivi du traitement',role:'Prometheus / Grafana · illustration',detail:'Signaux illustratifs et qualitatifs : résultat persisté, masquage effectué, accusé du worker et alerte en attente de revue. Aucun temps de réponse, débit, gain métier, taux de réussite ou indicateur de production n’est inventé.'},
];
export const bankingScenes:WorkflowScene[]=[
 {duration:3,chapter:'Le contexte',title:'Une réclamation fictive, une priorité explicable',output:'C-042 · API asynchrone · masquage avant IA · supervision humaine'},
 {node:'intake',duration:4,chapter:'01 · Recevoir',title:'Une réclamation contient un nom et un identifiant fictifs',output:'Amal Exemple · DEMO-CPT-0042 · exemples inventés'},
 {from:'intake',node:'api',duration:4,chapter:'02 · Valider',title:'FastAPI valide la requête entrante',output:'C-042 · format valide · admission du traitement'},
 {from:'api',node:'queue',duration:4,chapter:'02 · Découpler',contract:'202 Accepté · J-042 en file',title:'L’API répond pendant que le worker attend son message',output:'RabbitMQ · J-042 prêt · aucun résultat IA encore disponible'},
 {from:'queue',node:'privacy',duration:5,chapter:'03 · Protéger',title:'Le worker masque les identifiants avant toute étape IA',output:'Amal Exemple → [PERSONNE_01] · compte → [COMPTE_01]'},
 {from:'privacy',node:'graph',duration:4,chapter:'03 · Orchestrer',contract:'Texte masqué uniquement',title:'LangGraph reçoit le texte protégé',output:'[PERSONNE_01] · [COMPTE_01] · parcours IA prêt'},
 {from:'graph',node:'retrieval',duration:5,chapter:'04 · Contextualiser',title:'Le RAG retrouve une politique et un précédent fictifs',output:'POL-DEMO-01 + CAS-DEMO-07 · contexte inventé, non officiel'},
 {from:'retrieval',node:'llama',duration:6,chapter:'05 · Extraire',contract:'Texte masqué + références',title:'Llama 3 produit une extraction structurée vérifiable',output:'Thème : opération contestée · demande de blocage · schéma validé'},
 {from:'llama',node:'signals',duration:4,chapter:'05 · Justifier',title:'Les signaux restent reliés aux mots de la réclamation',output:'Insatisfaction exprimée · sensibilité à vérifier · citations conservées'},
 {from:'signals',node:'rules',duration:5,chapter:'06 · Prioriser',title:'Des règles transparentes calculent la priorité',output:'Non autorisée déclarée ET blocage demandé → P1 · R-DEMO-01'},
 {from:'rules',node:'record',duration:4,chapter:'07 · Persister',title:'Le résultat masqué et sa justification sont enregistrés',output:'PostgreSQL · C-042 · P1 · règle et références conservées'},
 {from:'record',node:'alert',duration:5,chapter:'07 · Signaler',issue:true,title:'Le cas justifié rejoint les alertes à relire',output:'P1 · R-DEMO-01 satisfaite · alerte interne de démonstration'},
 {from:'alert',node:'review',duration:4,chapter:'07 · Superviser',state:'partial',title:'Un analyste doit relire le dossier avant toute décision',output:'En attente de revue humaine · aucune action sur un compte'},
 {from:'record',node:'monitor',duration:4,chapter:'07 · Observer',title:'Le suivi montre les étapes confirmées du traitement',output:'Persisté · masqué · alerte à relire · aucune mesure de production'},
 {from:'monitor',node:'queue',duration:3,chapter:'07 · Acquitter',title:'Le worker confirme le traitement après persistance',output:'J-042 acquitté · l’API et le worker restent découplés'},
 {from:'queue',node:'monitor',duration:4,chapter:'Parcours terminé',state:'partial',title:'Un dossier traçable, une priorité justifiée, une revue à venir',output:'C-042 · P1 par règle · données masquées · analyste attendu'},
];
export const bankingStarts=bankingScenes.map((_,i)=>bankingScenes.slice(0,i).reduce((sum,scene)=>sum+scene.duration,0));
export const bankingDuration=bankingScenes.reduce((sum,scene)=>sum+scene.duration,0);
export const bankingCopy:WorkflowCopy={title:'Smart Banking',simulation:'Parcours illustratif · données fictives',play:'Lire',pause:'Pause',replay:'Rejouer',next:'Étape suivante',speed:'Vitesse',follow:'Suivre le parcours',overview:'Vue complète',progress:'Progression du traitement de réclamation',close:'Fermer les détails',details:'Détails du composant',waiting:'À venir',receiving:'Réception',processing:'Traitement',done:'Terminé',blocked:'Revue urgente',partial:'À relire',course:'Attijariwafa bank · scénario produit illustratif',assignment:'De la réclamation à la revue',intro:'Masquer avant l’IA. Extraire avec contexte. Prioriser par des règles.',deadline:'Client, compte, politique et précédent entièrement fictifs',roles:['API asynchrone','Worker protégé','Analyste'],notice:'Démonstration locale · aucun document bancaire réel ni action sur un compte.'};
export const bankingScenario:WorkflowDefinition={id:'banking',stages:bankingStages,scenes:bankingScenes,copy:bankingCopy,subtitle:'réclamations et confidentialité',introLabel:'Contexte de la réclamation fictive',environment:'FastAPI / RabbitMQ → worker masqué → règles → revue humaine',cardSize:{width:270,height:300}};
