export type StageId = 'roles'|'teacher'|'api'|'mysql'|'student'|'submission'|'mongo'|'grading'|'feedback'|'denied'|'results';
export type Stage = {id:StageId;label:string;role:string;detail:string;exception?:boolean};
export type Scene = {node?:StageId;from?:StageId;duration:number;title:string;output:string;chapter:string;issue?:boolean};

// All identities, dates and records are deterministic fiction. Storage roles are illustrative.
export const egradingStages:Stage[] = [
 {id:'roles',label:'Administration & rôles',role:'Accès par rôle',detail:'La promotion fictive INFO-3 reçoit des accès distincts : administration, enseignement et étudiant. Un rôle ne donne jamais accès à toutes les copies.'},
 {id:'teacher',label:'Espace enseignant',role:'Préparation pédagogique',detail:'Camille, enseignante fictive, crée « Modélisation de données ». Le devoir D-204 est destiné au cours INFO-3, du 12 au 19 mars 2027 à 18 h UTC.'},
 {id:'api',label:'API de publication',role:'Spring Boot',detail:'Le serveur vérifie le rôle enseignant et le cours avant de publier. Les règles présentées décrivent un parcours produit illustratif, sans appel réseau.'},
 {id:'mysql',label:'Données relationnelles',role:'MySQL · rôle illustratif',detail:'Illustration de données structurées : cours, devoirs et relations d’accès. Cette mise en scène ne documente pas un schéma de stockage réel.'},
 {id:'student',label:'Espace étudiant',role:'React',detail:'Lina, étudiante fictive inscrite à INFO-3, consulte D-204 et prépare modele.pdf. La date de remise illustrée est le 18 mars 2027 à 16 h 42 UTC.'},
 {id:'submission',label:'Réception de la copie',role:'Contrôles serveur',detail:'Vérifications illustrées : identité autorisée, inscription au cours, échéance, type PDF et taille de 1,2 Mo. Les métadonnées sont contrôlées côté serveur ; aucune copie réelle ne transite ici.'},
 {id:'mongo',label:'Documents & contenu',role:'MongoDB · rôle illustratif',detail:'Représentation plausible du contenu documentaire associé à une copie. Aucun format, emplacement de fichier ou partage exact MySQL / MongoDB n’est présenté comme une implémentation existante.'},
 {id:'grading',label:'Correction & évaluation',role:'Décision enseignante',detail:'Camille lit la copie, rédige une correction et attribue 16/20. La note et les commentaires sont entièrement synthétiques ; aucune correction automatique n’est suggérée.'},
 {id:'feedback',label:'Publication du retour',role:'Diffusion contrôlée',detail:'L’enseignante publie la note et son retour. La copie, son évaluation et l’identité de son propriétaire restent associées pour contrôler la consultation.'},
 {id:'denied',label:'Accès refusé',role:'Autre étudiant · 403',exception:true,detail:'Noé, autre étudiant fictif, tente de lire la copie de Lina. Le serveur refuse la consultation : aucun contenu de copie, note ou commentaire n’est renvoyé.'},
 {id:'results',label:'Résultats de Lina',role:'Consultation autorisée',detail:'Lina retrouve sa note de 16/20 et le retour de Camille : « Modèle cohérent ; préciser les cardinalités. » Le parcours s’achève sur une consultation autorisée.'},
];
export const egradingScenes:Scene[] = [
 {duration:3,chapter:'Le contexte',title:'Un devoir, trois rôles, un parcours partagé',output:'INFO-3 · D-204 · Modélisation de données'},
 {node:'roles',duration:5,chapter:'01 · Autoriser',title:'L’administration prépare les accès',output:'Camille : enseigner · Lina : remettre sa propre copie'},
 {from:'roles',node:'teacher',duration:5,chapter:'02 · Préparer',title:'Camille crée le devoir et son échéance',output:'D-204 · ouvert le 12/03 · remise avant le 19/03/2027, 18 h UTC'},
 {from:'teacher',node:'api',duration:5,chapter:'03 · Publier',title:'L’API autorise la publication dans INFO-3',output:'Rôle enseignant vérifié · cours INFO-3 autorisé'},
 {from:'api',node:'mysql',duration:4,chapter:'03 · Publier',title:'Le devoir est enregistré et rendu disponible',output:'D-204 · métadonnées associées au cours · état publié'},
 {from:'mysql',node:'student',duration:5,chapter:'04 · Remettre',title:'Lina ouvre le devoir et téléverse sa copie',output:'modele.pdf · 1,2 Mo · 18/03/2027, 16 h 42 UTC'},
 {from:'student',node:'submission',duration:6,chapter:'05 · Vérifier',title:'Le serveur contrôle la remise',output:'Accès ✓ · délai ✓ · métadonnées PDF ✓ · copie S-018 reçue'},
 {from:'submission',node:'mongo',duration:4,chapter:'05 · Conserver',title:'La copie validée est associée à son contenu',output:'S-018 ↔ D-204 ↔ Lina · contenu et référence conservés'},
 {from:'mongo',node:'grading',duration:6,chapter:'06 · Corriger',title:'Camille lit, annote et évalue la copie',output:'Évaluation enseignante : 16/20 · correction rédigée'},
 {from:'grading',node:'feedback',duration:5,chapter:'07 · Restituer',title:'L’enseignante publie son retour',output:'« Modèle cohérent ; préciser les cardinalités. »'},
 {from:'feedback',node:'denied',duration:5,chapter:'07 · Protéger',issue:true,title:'Une demande non autorisée est bloquée',output:'Noé demande S-018 · 403 · aucune note ni copie divulguée'},
 {from:'feedback',node:'results',duration:5,chapter:'07 · Restituer',title:'Lina consulte sa propre évaluation',output:'Propriétaire vérifié · 16/20 · commentaire de Camille disponible'},
 {node:'results',duration:5,chapter:'Parcours terminé',title:'Le retour pédagogique arrive à la bonne personne',output:'16/20 · « Modèle cohérent ; préciser les cardinalités. » · retour privé'},
];
export const egradingStarts=egradingScenes.map((_,i)=>egradingScenes.slice(0,i).reduce((sum,scene)=>sum+scene.duration,0));
export const egradingDuration=egradingScenes.reduce((sum,scene)=>sum+scene.duration,0);
export const egradingSceneAt=(time:number)=>egradingStarts.reduce((last,start,i)=>time>=start?i:last,0);
export const egradingCopy={
 title:'eGrading',simulation:'Parcours illustratif · données fictives',play:'Lire',pause:'Pause',replay:'Rejouer',next:'Étape suivante',speed:'Vitesse',follow:'Suivre le parcours',overview:'Vue complète',progress:'Progression du parcours eGrading',close:'Fermer les détails',details:'Détails du composant',waiting:'À venir',receiving:'Réception',processing:'Traitement',done:'Terminé',blocked:'Refusé',course:'INFO-3 · promotion fictive',assignment:'Modélisation de données',intro:'Camille publie. Lina remet sa copie. L’enseignante évalue.',deadline:'Échéance · 19 mars 2027, 18 h UTC',roles:['Administration','Enseignante','Étudiante'],notice:'Simulation locale : aucun service ni donnée personnelle réelle.',
};
