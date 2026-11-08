import type { Node, Edge } from '@xyflow/react';
import type { WorkflowDefinition } from './workflow-scenario';
export type ComponentData = { label:string; role:string; detail:string; agent?:boolean; active?:boolean; output?:string; revealed?:boolean };
export type WorkflowNode = Node<ComponentData>;
export type Beat = { node:string; from?:string; duration:number; title:string; output:string; issue?:boolean };
export const components:ComponentData[] = [
{label:'Google Calendar',role:'Calendrier de référence',detail:'La réservation existante de 19:30 fait autorité. Aucun calendrier parallèle dans ReSlot.'},
{label:'Événement reçu',role:'Entrée contrôlée',detail:'Normalise l’annulation et transmet son identifiant unique RS-1930.'},
{label:'Annulation',role:'Agent 01',agent:true,detail:'Vérifie ressource, horaire et disponibilité. Une clé unique empêche de traiter deux fois le même événement.'},
{label:'Google Sheets',role:'Liste d’attente · Atlas',detail:'Lecture limitée au restaurant Atlas. La liste du restaurant Jardin est exclue de cette exécution.'},
{label:'Matching',role:'Agent 02',agent:true,detail:'Classe les personnes consentantes, disponibles à 19:30 et compatibles avec une table de deux, puis départage par ancienneté.'},
{label:'Communication',role:'Agent 03',agent:true,detail:'Prépare une seule offre active par créneau, avec une échéance et un identifiant de tentative.'},
{label:'Gmail',role:'Canal de communication',detail:'Simulation locale des offres et confirmations. Aucun message réel n’est envoyé.'},
{label:'Réponse / échéance',role:'Décision',detail:'Refus ou expiration : candidat suivant. Acceptation : nouvelle validation. Une réponse tardive à une offre expirée est ignorée.'},
{label:'Supervision',role:'Agent 04',agent:true,detail:'Revérifie Calendar et contrôle la version de l’événement pour empêcher deux confirmations concurrentes.'},
{label:'Accord du responsable',role:'Validation humaine',detail:'La politique d’Atlas exige un accord humain. Aucune écriture Calendar avant cet accord.'},
{label:'PostgreSQL',role:'État & journal',detail:'Conserve les tentatives, échéances, décisions et autorisations. Ne remplace jamais le calendrier de réservation.'}
];
export const ids=['calendar','intake','cancel','sheets','match','communication','gmail','response','supervisor','owner','audit'];
export const nodes:WorkflowNode[]=components.map((data,i)=>({id:ids[i],type:'component',position:{x:(i%4)*260,y:Math.floor(i/4)*200},data}));
// Deterministic fictional data. Durations compress a real ten-minute offer window.
export const beats:Beat[]=[
{node:'calendar',duration:3,title:'Restaurant Atlas · une table de deux à 19:30',output:'Réservation annulée → créneau libre'},
{from:'calendar',node:'intake',duration:4,title:'L’annulation entre dans le circuit',output:'RS-1930 · événement unique reçu'},
{from:'intake',node:'cancel',duration:5,title:'Vérifier avant toute proposition',output:'Table 02 · 19:30 libre · doublon écarté'},
{from:'cancel',node:'sheets',duration:4,title:'Lire uniquement la liste du restaurant',output:'Atlas : accès autorisé · Jardin : exclu'},
{from:'sheets',node:'match',duration:5,title:'Classer selon des critères explicites',output:'Consentement + 2 places + 19:30 → Nadia, puis Sami'},
{from:'match',node:'communication',duration:4,title:'Préparer la première proposition',output:'Nadia · offre A · échéance 10 min'},
{from:'communication',node:'gmail',duration:4,title:'Transmettre une offre unique',output:'Offre A envoyée · envoi simulé'},
{from:'gmail',node:'response',duration:4,title:'Nadia décline la proposition',output:'Refus reçu · expiration = même branche de reprise',issue:true},
{from:'response',node:'match',duration:4,title:'Passer au candidat suivant',output:'Offre A close · Sami devient prioritaire',issue:true},
{from:'match',node:'communication',duration:4,title:'Préparer la seconde offre',output:'Sami · offre B · échéance 10 min'},
{from:'communication',node:'gmail',duration:3,title:'Envoyer la nouvelle proposition',output:'Offre B envoyée · aucune offre concurrente'},
{from:'gmail',node:'response',duration:4,title:'Sami accepte dans le délai',output:'Offre B acceptée · pas encore confirmée'},
{from:'response',node:'supervisor',duration:5,title:'Revérifier le calendrier avant confirmation',output:'Créneau libre · version vérifiée · verrou acquis'},
{from:'supervisor',node:'owner',duration:4,title:'Demander l’autorisation du responsable',output:'Accord humain reçu pour Sami · table 02'},
{from:'owner',node:'calendar',duration:4,title:'Mettre à jour le calendrier de référence',output:'Écriture autorisée · Sami · 19:30 confirmé'},
{from:'calendar',node:'gmail',duration:3,title:'Informer le client',output:'Confirmation envoyée à Sami · simulation'},
{from:'gmail',node:'audit',duration:3,title:'Enregistrer le résultat et clôturer',output:'RS-1930 terminé · autorisation et tentatives conservées'}
];
export const duration=beats.reduce((sum,b)=>sum+b.duration,0);
export const starts=beats.map((_,i)=>beats.slice(0,i).reduce((sum,b)=>sum+b.duration,0));
export function beatAt(time:number){let index=0;starts.forEach((start,i)=>{if(time>=start)index=i});return index}
export const edges:Edge[]=[...new Map(beats.filter(b=>b.from).map(b=>[`${b.from}-${b.node}`,{id:`${b.from}-${b.node}`,source:b.from!,target:b.node,type:'transfer'}])).values()];
export const labels={play:'Lire',pause:'Pause',replay:'Rejouer',next:'Étape suivante',speed:'Vitesse',progress:'Progression du scénario',overview:'Vue complète',follow:'Suivre l’action',close:'Fermer les détails'};
export function createReslotJourney(response:'decline'|'timeout'='decline'):WorkflowDefinition{
 return {
  id:'reslot',subtitle:'un créneau, une confirmation',introLabel:'Contexte du restaurant fictif',environment:'LangGraph · Calendar / Sheets / Gmail simulés · accord humain',cardSize:{width:270,height:270},mobileCardSize:{width:270,height:180},
  stages:ids.map((id,i)=>({id,...components[i]})),
  scenes:[{duration:3,chapter:'Le contexte',title:'Une table se libère, la liste d’attente prend le relais',output:'Restaurant Atlas · 19 h 30 · deux personnes · données fictives'},...beats.map((beat,i)=>({...beat,chapter:`${String(i+1).padStart(2,'0')} · ${i<4?'Vérifier':i<12?'Proposer':i<14?'Superviser':'Confirmer'}`,...(i===7&&response==='timeout'?{title:'Le délai de réponse est écoulé',output:'Offre A expirée · délai de 10 min condensé dans le récit'}:{})}))],
  copy:{title:'ReSlot AI',simulation:'Parcours illustratif · données fictives',...labels,details:'Détails du composant',waiting:'À venir',receiving:'Réception',processing:'Traitement',done:'Terminé',blocked:'Offre close',course:'Restaurant Atlas · scénario fictif',assignment:'Une table retrouve ses convives',intro:'Un créneau annulé, une proposition à la fois, une validation humaine.',deadline:'19 h 30 · table pour deux · aucun message réel',roles:['Disponibilité','Liste d’attente','Accord humain'],notice:'Simulation locale · aucun message ni réservation réelle.'},
 };
}
