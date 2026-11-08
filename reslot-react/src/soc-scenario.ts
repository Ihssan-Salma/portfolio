import type { Edge } from '@xyflow/react';
import type { Beat, WorkflowNode } from './scenario';
import type { WorkflowDefinition } from './workflow-scenario';

// Fictional documentation address, host and event identifiers. No remote requests.
export const socNodes: WorkflowNode[] = [
 ['logs','Journaux SSH','Source synthétique','E01–E05 : échecs, puis E06 : connexion réussie. Hôte labo-01, IP documentaire 192.0.2.24.'],
 ['adapter','Adaptateur d’alertes','Format inspiré de Wazuh','Données locales uniquement ; aucune connexion à une installation Wazuh.'],
 ['normalize','Normalisation','Horodatage & dédoublonnage','UTC, hôte, IP source et type d’événement. Le doublon E03 est écarté par identifiant.'],
 ['triage','Triage','Agent','Regroupe les événements par hôte, source et fenêtre temporelle. Une réussite après plusieurs échecs motive une vérification, pas une conclusion.'],
 ['context','Contexte ATT&CK','Connaissances','Tentatives de mots de passe et usage de compte valide : pistes de classification, pas preuves d’une attaque.'],
 ['evidence','Collecte de preuves','Agent','Récupère les événements E01–E06 et conserve leurs références. Aucun journal de processus ni validation du propriétaire du compte ne sont disponibles.'],
 ['correlate','Corrélation','Agent','Reconstruit la séquence. Compare tentative malveillante et erreur légitime de mot de passe.'],
 ['alternative','Piste de faux positif','Hypothèse alternative','Un utilisateur a pu corriger son mot de passe. Vérifier auprès du propriétaire et comparer avec les habitudes de connexion.'],
 ['assessment','Évaluation','Confiance & sévérité','Priorité de vérification modérée. Confiance limitée : les seuls journaux SSH ne prouvent pas une compromission.'],
 ['report','Rapport provisoire','Sources & limites','Résumé : cinq échecs puis une réussite. Sources : E01–E06. Vérifications : propriétaire, MFA et activité après connexion.'],
 ['review','Analyste SOC','Décision humaine','Classer sans suite, approfondir ou escalader. Aucun blocage de compte ni confinement automatique.'],
].map(([id,label,role,detail],i)=>({id,type:'component',position:{x:(i%3)*285,y:Math.floor(i/3)*195},data:{label,role,detail,agent:role==='Agent'}}));
export const socBeats:Beat[]=[
 {node:'logs',duration:3,title:'Une connexion mérite un examen',output:'09:41–09:44 UTC · cinq échecs SSH, puis une réussite'},
 {from:'logs',node:'adapter',duration:5,title:'Recevoir l’alerte simulée',output:'Cas SOC-017 · labo-01 · 192.0.2.24'},
 {from:'adapter',node:'normalize',duration:5,title:'Rendre les événements comparables',output:'UTC · hôte · IP · type · doublon E03 écarté'},
 {from:'normalize',node:'triage',duration:6,title:'Expliquer le signal de triage',output:'Même source et même hôte : échecs rapprochés puis succès'},
 {from:'triage',node:'context',duration:5,title:'Consulter le contexte comportemental',output:'Tentatives de mots de passe / compte valide : pistes à vérifier'},
 {from:'context',node:'evidence',duration:6,title:'Rassembler les preuves disponibles',output:'E01–E05 : échecs ; E06 : succès. Attribution inconnue.'},
 {from:'evidence',node:'correlate',duration:6,title:'Reconstruire la chronologie',output:'09:41 échecs → 09:44 succès · activité ultérieure inconnue'},
 {from:'correlate',node:'alternative',duration:5,title:'Examiner une explication légitime',output:'Mot de passe corrigé ? Confirmation du propriétaire manquante.'},
 {from:'alternative',node:'assessment',duration:6,title:'Exprimer l’incertitude',output:'Vérification prioritaire · confiance limitée · compromission non établie'},
 {from:'assessment',node:'report',duration:6,title:'Préparer un rapport sourcé',output:'Résumé, E01–E06, hypothèses et contrôles MFA / activité'},
 {from:'report',node:'review',duration:6,title:'Transmettre à l’analyste',output:'Choisir une suite : classer, approfondir ou escalader.'},
 {node:'review',duration:5,title:'L’enquête attend une décision humaine',output:'Aucune réponse automatique · les conclusions restent provisoires'},
];
export const socStarts=socBeats.map((_,i)=>socBeats.slice(0,i).reduce((s,b)=>s+b.duration,0));
export const socDuration=socBeats.reduce((s,b)=>s+b.duration,0);
export const socEdges:Edge[]=socBeats.filter(b=>b.from).map(b=>({id:`${b.from}-${b.node}`,source:b.from!,target:b.node,type:'transfer'}));
export const decisions={dismiss:'Classer sans suite : justification humaine requise, faux positif à documenter.',investigate:'Approfondir : demander les journaux MFA et l’activité après connexion.',escalate:'Escalader : transmettre les preuves et leurs limites à l’équipe SOC.'};
export const socJourney:WorkflowDefinition={
 id:'soc',subtitle:'des preuves, puis un analyste',introLabel:'Contexte de l’alerte synthétique',environment:'Journaux synthétiques · pistes ATT&CK · décision humaine',cardSize:{width:270,height:270},mobileCardSize:{width:270,height:180},
 stages:socNodes.map(node=>({id:node.id,label:node.data.label,role:node.data.role,detail:node.data.detail})),
 scenes:[{duration:3,chapter:'Le contexte',title:'Cinq échecs SSH, puis une réussite : que vérifier ?',output:'SOC-017 · labo-01 · 192.0.2.24 · exemple synthétique'},...socBeats.map((beat,i)=>({...beat,chapter:`${String(i+1).padStart(2,'0')} · ${i<3?'Préparer':i<6?'Documenter':i<9?'Évaluer':'Transmettre'}`,...(i>=10?{state:'partial' as const}:{})}))],
 copy:{title:'SOC Sentinel AI',simulation:'Parcours illustratif · données fictives',play:'Lire',pause:'Pause',replay:'Rejouer',next:'Étape suivante',speed:'Vitesse',follow:'Suivre le parcours',overview:'Vue complète',progress:'Progression de l’enquête SOC',close:'Fermer les détails',details:'Détails du composant',waiting:'À venir',receiving:'Réception',processing:'Traitement',done:'Terminé',blocked:'À vérifier',partial:'Décision attendue',course:'SOC-017 · laboratoire fictif',assignment:'Du signal à l’enquête',intro:'Corréler les événements, examiner les alternatives et documenter les limites.',deadline:'09 h 41–09 h 44 UTC · aucune compromission présumée acquise',roles:['Preuves','Hypothèses','Analyste SOC'],notice:'Simulation locale · aucune action sur un système réel.'},
};
