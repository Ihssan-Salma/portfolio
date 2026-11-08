import type {WorkflowDefinition,WorkflowStage,WorkflowScene,WorkflowCopy} from './workflow-scenario';

export const expressionClasses=['Colère','Dégoût','Peur','Joie','Tristesse','Surprise','Neutre'];
// Synthetic network outputs, not measured accuracy or calibrated probabilities.
export const exampleScores=[.05,.02,.06,.64,.08,.08,.07];
export const weakScores=[.16,.08,.18,.22,.13,.12,.11];
export const illustrativeThreshold=.45;
export const smoothingAlpha=.35;
export const sequenceScores=[
 [.05,.02,.06,.64,.08,.08,.07],
 [.01,.01,.02,.46,.01,.47,.02],
 [.05,.02,.04,.66,.06,.10,.07],
 [.01,.01,.02,.44,.02,.48,.02],
 [.04,.02,.04,.68,.06,.09,.07],
];
export function smoothDistributions(frames:number[][],alpha=smoothingAlpha):number[][]{
 return frames.reduce<number[][]>((history,frame)=>[...history,history.length?frame.map((score,i)=>alpha*score+(1-alpha)*history.at(-1)![i]):[...frame]],[]);
}
export const smoothedScores=smoothDistributions(sequenceScores);
export const topClass=(scores:number[])=>scores.indexOf(Math.max(...scores));
export const acceptedClass=(scores:number[])=>Math.max(...scores)>=illustrativeThreshold?topClass(scores):null;
export const facialStages:WorkflowStage[]=[
 {id:'frame',label:'Trame vidéo',role:'Clip vectoriel synthétique',detail:'F-042 représente un visage dessiné en SVG, sans identité réelle. Aucun flux webcam, vidéo personnelle ou fichier envoyé. Les trames suivantes sont des exemples déterministes construits pour raconter le traitement.'},
 {id:'detection',label:'Localisation du visage',role:'OpenCV',detail:'OpenCV représente ici la localisation d’une région de visage dans une trame. Un rectangle localise une région d’intérêt ; il n’identifie pas une personne. La position et les coordonnées affichées sont synthétiques.'},
 {id:'preprocess',label:'Recadrage & préparation',role:'Région du visage',detail:'Illustration : recadrage, passage en niveaux de gris, redimensionnement 48 × 48 et normalisation des pixels dans [0, 1]. Les paramètres représentent un exemple pédagogique, pas un inventaire de l’implémentation du dépôt.'},
 {id:'cnn',label:'Inférence du CNN',role:'TensorFlow / Keras · FER2013',detail:'Un CNN entraîné sur FER2013 est représenté par extraction de caractéristiques, agrégation et sept sorties. Aucune architecture précise, exécution réelle de modèle ou performance du dépôt n’est affirmée.'},
 {id:'scores',label:'Sept scores de classe',role:'Sorties synthétiques',detail:'Classes FER2013 présentées en français : colère, dégoût, peur, joie, tristesse, surprise et neutre. Les scores totalisent 100 % dans ces exemples. Un score de sortie ne mesure ni la fiabilité réelle du système ni l’état émotionnel interne d’une personne.'},
 {id:'confidence',label:'Gestion de la confiance',role:'Décision ou abstention',detail:'Seuil de démonstration arbitraire : score maximal ≥ 45 %. Il ne constitue pas un seuil validé ou calibré. L’exemple à 22 % provoque une abstention. Une faible confiance ne devient pas une certitude par lissage.'},
 {id:'smoothing',label:'Lissage entre trames',role:'Moyenne exponentielle',detail:'Nouvelle séquence synthétique F-044 à F-048 : moyenne exponentielle de coefficient 0,35 sur les sept scores. L’argmax brut alterne joie / surprise ; l’argmax lissé reste joie. Le seuil est vérifié après lissage. Cette réduction du clignotement ne prouve aucune émotion ni aucun gain d’exactitude.'},
 {id:'overlay',label:'Surimpression visuelle',role:'Classe visible, pas émotion',detail:'La région du visage reçoit une catégorie et son score lorsque la règle illustrative le permet. Sinon : « Indéterminé », sans catégorie définitive. Une expression visible n’est pas une lecture fiable de l’état émotionnel interne.'},
 {id:'evaluation',label:'Évaluation hors ligne',role:'F1 & matrice de confusion',detail:'Concept : utiliser un jeu de test distinct de l’entraînement, comparer les classes prédites aux annotations, examiner précision, rappel et F1 par classe. La matrice illustre accords sur la diagonale et désaccords ailleurs. Aucun score F1, nombre de cas ou résultat de performance n’est fourni.'},
];
export const facialScenes:WorkflowScene[]=[
 {duration:3,chapter:'Le contexte',title:'Une expression visible, pas un état intérieur',output:'Clip synthétique · aucune caméra ouverte · sept catégories FER2013'},
 {node:'frame',duration:4,chapter:'01 · Recevoir',title:'Une trame synthétique entre dans le pipeline',output:'F-042 · visage dessiné · aucune donnée personnelle'},
 {from:'frame',node:'detection',duration:4,chapter:'02 · Localiser',title:'OpenCV localise la région du visage',output:'Région d’intérêt trouvée · aucune identification'},
 {from:'detection',node:'preprocess',duration:4,chapter:'02 · Préparer',title:'La région est recadrée et normalisée',output:'Niveaux de gris · 48 × 48 · pixels normalisés dans [0, 1]'},
 {from:'preprocess',node:'cnn',duration:5,chapter:'03 · Classer',title:'Le CNN produit sept scores de sortie',output:'TensorFlow / Keras · catégories FER2013 · inférence illustrée'},
 {from:'cnn',node:'scores',duration:4,chapter:'03 · Comparer',title:'La distribution privilégie une catégorie',output:'F-042 · classe « joie » : 64 % · scores entièrement synthétiques'},
 {from:'scores',node:'confidence',duration:4,chapter:'04 · Décider',title:'Le score dépasse le seuil de démonstration',output:'64 % ≥ 45 % · règle illustrative, non calibrée'},
 {from:'confidence',node:'overlay',duration:4,chapter:'04 · Afficher',title:'Une classe et son score accompagnent la région',output:'Classe « joie » · score synthétique 64 % · pas une émotion mesurée'},
 {from:'cnn',node:'scores',duration:4,chapter:'04 · Examiner',title:'La trame suivante donne une distribution peu tranchée',output:'F-043 · score maximal : 22 % · plusieurs catégories proches'},
 {from:'scores',node:'confidence',duration:4,chapter:'04 · S’abstenir',issue:true,title:'La confiance faible déclenche une abstention',output:'22 % < 45 % · aucune catégorie définitive'},
 {from:'confidence',node:'overlay',duration:4,chapter:'04 · Afficher',state:'partial',title:'La surimpression reste prudente',output:'F-043 · « Indéterminé » · étiquette de classe masquée'},
 {from:'scores',node:'smoothing',duration:5,chapter:'05 · Stabiliser',title:'Une nouvelle séquence est lissée sur cinq trames',output:'F-044 → F-048 · moyenne exponentielle · moins de changements de classe'},
 {from:'smoothing',node:'overlay',duration:4,chapter:'05 · Restituer',title:'La surimpression utilise les scores lissés',output:'F-048 · classe « joie » · score lissé synthétique 59 %'},
 {node:'overlay',duration:4,chapter:'06 · Interpréter',title:'L’expression ne révèle pas une émotion intérieure',output:'Une catégorie visuelle reste une interprétation limitée du visage'},
 {from:'overlay',node:'evaluation',duration:5,chapter:'07 · Évaluer hors ligne',title:'Le F1 décrit le compromis entre précision et rappel',output:'Évaluation par classe sur un jeu de test distinct · aucune valeur inventée'},
 {node:'evaluation',duration:5,chapter:'07 · Examiner les erreurs',title:'La matrice compare annotations et prédictions',output:'Diagonale : accords · hors diagonale : désaccords · schéma non mesuré'},
 {node:'evaluation',duration:3,chapter:'Parcours terminé',title:'Classer une expression, documenter les limites',output:'OpenCV · TensorFlow / Keras · FER2013 · aucune performance chiffrée'},
];
export const facialStarts=facialScenes.map((_,i)=>facialScenes.slice(0,i).reduce((sum,scene)=>sum+scene.duration,0));
export const facialDuration=facialScenes.reduce((sum,scene)=>sum+scene.duration,0);
export const facialCopy:WorkflowCopy={title:'Expressions faciales',simulation:'Parcours illustratif · données fictives',play:'Lire',pause:'Pause',replay:'Rejouer',next:'Étape suivante',speed:'Vitesse',follow:'Suivre le parcours',overview:'Vue complète',progress:'Progression de la classification d’expressions',close:'Fermer les détails',details:'Détails du composant',waiting:'À venir',receiving:'Réception',processing:'Traitement',done:'Terminé',blocked:'Abstention',partial:'Sans étiquette',course:'Démonstration vectorielle · aucune identité réelle',assignment:'Du pixel à la catégorie',intro:'Localiser, préparer, classer — puis garder les limites visibles.',deadline:'Sept catégories d’expression · aucune lecture d’émotion intérieure',roles:['OpenCV','CNN · Keras','Évaluation hors ligne'],notice:'Visage synthétique · aucun accès caméra · aucune émotion inférée.'};
export const facialScenario:WorkflowDefinition={id:'facial',stages:facialStages,scenes:facialScenes,copy:facialCopy,subtitle:'une catégorie, pas une émotion',introLabel:'Contexte de la trame synthétique',environment:'OpenCV · TensorFlow / Keras · FER2013 · scores de démonstration',cardSize:{width:270,height:300}};
