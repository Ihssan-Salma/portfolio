import type {WorkflowCopy, WorkflowDefinition, WorkflowScene, WorkflowStage} from './workflow-scenario';

// All observations, road sections and source files below are invented locally.
// Each year covers one comparable fictional Tuesday in June, not a full year.
export const years = [2022, 2023, 2024] as const;
export type Year = typeof years[number];
export const roads = [{id:'TR-A',label:'Tronçon A'},{id:'TR-B',label:'Tronçon B'}] as const;
export type RoadId = typeof roads[number]['id'];
export const trafficHours = ['07 h','09 h','12 h','15 h','18 h','21 h'] as const;
export type TrafficHour = typeof trafficHours[number];
export const trafficSampleDates:Record<Year,string> = {2022:'2022-06-14',2023:'2023-06-13',2024:'2024-06-11'};
export const trafficCoverage = 'Données entièrement fictives · un mardi de juin par année · six créneaux horaires par tronçon · volumes d’extraits, jamais des totaux annuels.';
export const trafficCleaningRules = {maximumDemoCount:2000, missingPolicy:'Conserver la trace et exclure du calcul, sans remplacer par zéro.'} as const;

export type TrafficRawRow = {sourceId:string;date:string;road:string;hour:string;count:number|null};
export type TrafficObservation = {sourceId:string;date:string;dateKey:number;road:RoadId;hour:TrafficHour;count:number};
export type TrafficAuditStatus = 'accepted'|'missing'|'duplicate'|'anomaly'|'invalid';
export type TrafficAuditRow = {raw:TrafficRawRow;status:TrafficAuditStatus;reason:string;normalized?:TrafficObservation};
export type TrafficCleaningResult = {facts:TrafficObservation[];audit:TrafficAuditRow[];issues:TrafficAuditRow[]};

const sampleCounts:Record<Year,Record<RoadId,readonly number[]>> = {
 2022:{'TR-A':[160,210,145,225,330,180],'TR-B':[120,155,110,165,240,130]},
 2023:{'TR-A':[170,225,150,240,360,190],'TR-B':[130,165,115,175,265,135]},
 2024:{'TR-A':[185,240,160,260,405,205],'TR-B':[138,178,120,190,280,145]},
};

export const trafficRawRows:TrafficRawRow[] = years.flatMap(year=>roads.flatMap((road,roadIndex)=>trafficHours.map((hour,index)=>({
 sourceId:`DEMO-${year}-${roadIndex+1}-${index+1}`,
 date:year===2023?'13/06/2023':trafficSampleDates[year],
 road:roadIndex===0?' tr a ':'B',hour,count:sampleCounts[year][road.id][index],
}))));
trafficRawRows.push(
 {sourceId:'DEMO-MANQUANT',date:'11/06/2024',road:'TR-A',hour:'12 h',count:null},
 {sourceId:'DEMO-A-VERIFIER',date:'2024-06-11',road:'TR-A',hour:'18 h',count:99999},
 {sourceId:'DEMO-DOUBLON',date:'14/06/2022',road:'A',hour:'07 h',count:160},
 {sourceId:'DEMO-DATE-INVALIDE',date:'31/02/2024',road:'TR-B',hour:'09 h',count:180},
);

export function normalizeTrafficDate(value:string):string|null {
 const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
 const french=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
 if(!iso&&!french)return null;
 const year=Number(iso?.[1]??french?.[3]);
 const month=Number(iso?.[2]??french?.[2]);
 const day=Number(iso?.[3]??french?.[1]);
 const date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export function normalizeTrafficRoad(value:string):RoadId|null {
 const alias=value.trim().toUpperCase().replace(/[\s_-]/g,'');
 return alias==='A'||alias==='TRA'?'TR-A':alias==='B'||alias==='TRB'?'TR-B':null;
}

export function cleanTrafficRows(rows:readonly TrafficRawRow[]):TrafficCleaningResult {
 const facts:TrafficObservation[]=[];
 const audit:TrafficAuditRow[]=[];
 const seen=new Set<string>();
 for(const raw of rows){
  const date=normalizeTrafficDate(raw.date);
  const road=normalizeTrafficRoad(raw.road);
  const hour=trafficHours.find(candidate=>candidate===raw.hour.trim());
  if(!date||!road||!hour||!years.includes(Number(date.slice(0,4)) as Year)){
   audit.push({raw,status:'invalid',reason:'Date, tronçon ou créneau non reconnu : ligne conservée pour vérification.'});continue;
  }
  if(raw.count===null){
   audit.push({raw,status:'missing',reason:'Observation absente : conservée dans le journal et exclue des sommes, sans imputation.'});continue;
  }
  if(!Number.isInteger(raw.count)||raw.count<0||raw.count>trafficCleaningRules.maximumDemoCount){
   audit.push({raw,status:'anomaly',reason:'Valeur hors de la règle de contrôle illustrative : à vérifier, sans cause supposée.'});continue;
  }
  const normalized:TrafficObservation={sourceId:raw.sourceId,date,dateKey:Number(date.replaceAll('-','')),road,hour,count:raw.count};
  const key=`${date}|${road}|${hour}`;
  if(seen.has(key)){
   audit.push({raw,status:'duplicate',reason:'Clé date / tronçon / créneau déjà présente : seconde ligne isolée pour vérification.',normalized});continue;
  }
  seen.add(key);
  facts.push(normalized);
  audit.push({raw,status:'accepted',reason:'Observation normalisée et disponible pour le modèle.',normalized});
 }
 return {facts,audit,issues:audit.filter(row=>row.status!=='accepted')};
}

export const trafficCleaning=cleanTrafficRows(trafficRawRows);

function createCalendar(){
 const dates:{dateKey:number;date:string;annee:number;mois:number;jour:number}[]=[];
 for(let time=Date.UTC(2022,0,1);time<=Date.UTC(2024,11,31);time+=86400000){
  const date=new Date(time);
  const iso=date.toISOString().slice(0,10);
  dates.push({dateKey:Number(iso.replaceAll('-','')),date:iso,annee:date.getUTCFullYear(),mois:date.getUTCMonth()+1,jour:date.getUTCDate()});
 }
 return dates;
}

export const trafficStarSchema={
 grain:'Une observation par date, tronçon, lieu de comptage fictif et créneau horaire.',
 dates:createCalendar(),
 routes:roads.map(road=>({routeKey:road.id,label:road.label})),
 locations:[{locationKey:'L-A',label:'Point de démonstration A'},{locationKey:'L-B',label:'Point de démonstration B'}],
 facts:trafficCleaning.facts.map(row=>({
  dateKey:row.dateKey,routeKey:row.road,locationKey:row.road==='TR-A'?'L-A':'L-B',
  creneau:row.hour,nombreVehicules:row.count,
 })),
 relationships:[
  {from:'Dates[DateKey]',to:'FaitsTrafic[DateKey]',cardinality:'1 → *'},
  {from:'Troncons[RouteKey]',to:'FaitsTrafic[RouteKey]',cardinality:'1 → *'},
  {from:'Lieux[LocationKey]',to:'FaitsTrafic[LocationKey]',cardinality:'1 → *'},
 ],
};

// Prior-year selection intentionally compares equally covered sample extracts.
// A day-for-day DATEADD would not match the chosen Tuesdays in this small fixture.
export const trafficDax={
 volume:'Volume démo = SUM(FaitsTrafic[NombreVehicules])',
 previousVolume:'Volume N-1 démo = VAR AnneeChoisie = SELECTEDVALUE(Dates[Annee]) RETURN IF(NOT ISBLANK(AnneeChoisie), CALCULATE([Volume démo], FILTER(ALL(Dates), Dates[Annee] = AnneeChoisie - 1)))',
 yearlyEvolution:'Évolution extrait = VAR Precedent = [Volume N-1 démo] RETURN IF(NOT ISBLANK(Precedent), DIVIDE([Volume démo] - Precedent, Precedent))',
 peak:'Volume 18 h démo = CALCULATE([Volume démo], FaitsTrafic[Creneau] = "18 h")',
 offPeak:'Volume 12 h démo = CALCULATE([Volume démo], FaitsTrafic[Creneau] = "12 h")',
 peakComparison:'Écart 18 h / 12 h démo = [Volume 18 h démo] - [Volume 12 h démo]',
};

export type TrafficView={
 labels:string[];counts:number[];volume:number;previousVolume:number|null;evolution:number|null;
 peak:{label:string;count:number};comparison:{peak:number;offPeak:number};
};

function observedCounts(year:Year,road:RoadId):number[]{
 return trafficHours.map(hour=>{
  const observations=trafficCleaning.facts.filter(row=>row.date===trafficSampleDates[year]&&row.road===road&&row.hour===hour);
  // Every chart bucket has an actual accepted observation. Missing ≠ zero.
  if(observations.length===0)throw new Error(`Observation de démonstration absente : ${year} / ${road} / ${hour}`);
  return observations.reduce((sum,row)=>sum+row.count,0);
 });
}

export function getTrafficView(year:Year,road:RoadId):TrafficView {
 if(!years.includes(year)||!roads.some(candidate=>candidate.id===road))throw new Error('Filtre de démonstration non reconnu.');
 const counts=observedCounts(year,road);
 const volume=counts.reduce((sum,count)=>sum+count,0);
 const previousYear=years.find(candidate=>candidate===year-1);
 const previousVolume=previousYear===undefined?null:observedCounts(previousYear,road).reduce((sum,count)=>sum+count,0);
 const peakIndex=counts.indexOf(Math.max(...counts));
 return {
  labels:[...trafficHours],counts,volume,previousVolume,
  evolution:previousVolume===null||previousVolume===0?null:(volume-previousVolume)/previousVolume,
  peak:{label:trafficHours[peakIndex],count:counts[peakIndex]},
  comparison:{peak:counts[trafficHours.indexOf('18 h')],offPeak:counts[trafficHours.indexOf('12 h')]},
 };
}

const integer=new Intl.NumberFormat('fr-FR');
const percentage=new Intl.NumberFormat('fr-FR',{style:'percent',maximumFractionDigits:1,signDisplay:'exceptZero'});

export const trafficStages:WorkflowStage[]=[
 {id:'sources',label:'Sources 2022–2024',role:'Extraits de comptages fictifs',detail:`Trois fichiers de démonstration, deux tronçons fictifs et six créneaux observés pour une journée comparable par année. ${trafficCoverage} Aucun flux routier réel ni donnée individuelle.`},
 {id:'cleaning',label:'Valider & nettoyer',role:'Qualité et traçabilité',detail:'Les dates et alias de tronçons sont normalisés. Les observations absentes restent absentes ; les doublons, dates invalides et valeurs hors règle illustrative sont isolés. Aucune cause de trafic n’est déduite de ces anomalies. Le seuil de contrôle de 2 000 est propre à cette démonstration.'},
 {id:'dimensions',label:'Dates, tronçons & lieux',role:'Dimensions du modèle',detail:'Un calendrier unique et continu couvre 2022 à 2024. Deux dimensions décrivent les tronçons et leurs points de comptage fictifs. Chaque clé de dimension est unique ; les relations vers les faits sont de type un à plusieurs.'},
 {id:'facts',label:'Faits de trafic',role:'Schéma en étoile',detail:'Une ligne de faits représente une observation de comptage pour une date, un tronçon, un lieu fictif et un créneau. Les faits portent les clés des dimensions et NombreVehicules. Les absences ne deviennent jamais des comptages nuls.'},
 {id:'dax',label:'Mesures DAX',role:'Calculs lisibles et vérifiables',detail:'Volume démo additionne les observations retenues. L’évolution compare les extraits de couverture équivalente avec l’année précédente, en conservant le filtre de tronçon. La première année n’a pas de référence. La comparaison 18 h / 12 h porte sur deux créneaux observés, sans extrapolation annuelle.'},
 {id:'dashboard',label:'Tableau de bord Power BI',role:'Visualisation analytique',detail:'Ce tableau de bord illustré traduit le modèle Power BI en graphiques interactifs locaux. La somme, la comparaison avec l’extrait précédent et les barres horaires se recalculent depuis les mêmes observations fictives. Aucun service Power BI externe n’est appelé.'},
 {id:'filters',label:'Année & tronçon',role:'Filtres liés aux dimensions',detail:'Choisir une année et un tronçon met à jour le volume de l’extrait, les six barres et leur comparaison. Les filtres restent utilisables pendant la lecture ; ils ne redémarrent pas l’animation. Les libellés A et B ne désignent aucune route réelle.'},
 {id:'peaks',label:'Comparer les pointes',role:'Observation, sans prédiction',detail:'Le maximum des créneaux affichés est un pic de comptage observé dans l’échantillon fictif. Le volume seul ne prouve pas un embouteillage : vitesse, capacité, durée et contexte seraient nécessaires pour caractériser une congestion. Aucune cause ni prévision n’est inventée.'},
 {id:'insights',label:'Éclairer une décision',role:'Un constat à approfondir',detail:'Le créneau présentant le plus de passages fournit une piste de vérification pour un décideur. Il faut compléter la couverture et consulter le contexte avant de conclure sur une congestion ou de planifier une action. Aucun gain opérationnel ni pourcentage d’amélioration n’est revendiqué.'},
];

export const trafficCopy:WorkflowCopy={
 title:'Autoroutes du Maroc · Traffic Analytics',simulation:'Démonstration · données fictives',
 play:'Lire',pause:'Pause',replay:'Rejouer',next:'Étape suivante',speed:'Vitesse',follow:'Suivre le parcours',overview:'Vue complète',
 progress:'Progression de l’analyse du trafic',close:'Fermer les détails',details:'Détails du composant',waiting:'À venir',receiving:'Réception',processing:'Traitement',done:'Terminé',blocked:'À vérifier',
 course:'Autoroutes du Maroc · analyse du trafic',assignment:'Des comptages à un constat exploitable',
 intro:'Relier des extraits de trafic, un modèle en étoile et un tableau de bord filtrable.',
 deadline:'2022–2024 · journées fictives comparables · aucun total annuel',roles:['Données','Modèle en étoile','Power BI / DAX'],
 notice:trafficCoverage,
};

export function createTrafficScenario(year:Year=2024,road:RoadId='TR-A'):WorkflowDefinition {
 const view=getTrafficView(year,road);
 const roadLabel=roads.find(candidate=>candidate.id===road)!.label;
 const scope=`${year} · ${roadLabel} · extrait démo`;
 const evolution=view.evolution===null?'Référence N−1 indisponible pour 2022':`${percentage.format(view.evolution)} face à l’extrait ${year-1} de même couverture`;
 const scenes:WorkflowScene[]=[
  {duration:3,chapter:'Le contexte',title:'Des comptages au tableau de bord',output:'2022–2024 · données fictives · une journée comparable par année'},
  {node:'sources',duration:4,chapter:'01 · Importer',title:'Importer les trois années de démonstration',output:`${trafficRawRows.length} lignes source · deux tronçons fictifs · six créneaux par journée`},
  {from:'sources',node:'cleaning',duration:4,chapter:'02 · Normaliser',title:'Uniformiser les dates et identifiants de tronçons',output:'13/06/2023 → 2023-06-13 · « tr a » → TR-A'},
  {node:'cleaning',duration:4,chapter:'02 · Contrôler',issue:true,title:'Isoler les observations à vérifier',output:'1 absence · 1 valeur atypique · 1 doublon · 1 date invalide · aucune cause supposée'},
  {from:'cleaning',node:'dimensions',duration:5,chapter:'03 · Modéliser',title:'Préparer des dimensions aux clés uniques',output:'Calendrier continu 2022–2024 · Tronçons · Lieux de démonstration'},
  {from:'dimensions',node:'facts',duration:4,chapter:'03 · Relier',title:'Relier les comptages au schéma en étoile',output:`${trafficStarSchema.facts.length} observations retenues · dimensions 1 → * faits · valeurs absentes exclues`},
  {from:'facts',node:'dax',duration:5,chapter:'04 · Mesurer',title:'Additionner les observations de l’extrait filtré',output:`${scope} · ${integer.format(view.volume)} passages démo · somme de six créneaux`},
  {node:'dax',duration:5,chapter:'04 · Comparer',title:'Comparer les extraits de deux années successives',output:evolution},
  {node:'dax',duration:4,chapter:'04 · Détailler',title:'Comparer deux créneaux de la même journée',output:`18 h : ${integer.format(view.comparison.peak)} · 12 h : ${integer.format(view.comparison.offPeak)} passages démo`},
  {from:'dax',node:'dashboard',duration:5,chapter:'05 · Visualiser',title:'Afficher le tableau de bord Power BI illustré',output:`${scope} · volumes horaires et indicateurs issus des mêmes faits`},
  {from:'dashboard',node:'filters',duration:5,chapter:'05 · Filtrer',title:'Explorer une année et un tronçon',output:`Sélection active : ${year} · ${roadLabel} · filtres disponibles dans le lecteur`},
  {from:'filters',node:'dashboard',duration:4,chapter:'05 · Actualiser',title:'Recalculer les graphiques depuis la sélection',output:`${integer.format(view.volume)} passages démo · maximum à ${view.peak.label} : ${integer.format(view.peak.count)}`},
  {from:'dashboard',node:'peaks',duration:5,chapter:'06 · Observer',title:'Repérer le créneau le plus chargé de l’extrait',output:`${view.peak.label} : ${integer.format(view.peak.count)} passages démo · pic observé, aucune prédiction ni congestion établie`},
  {from:'peaks',node:'insights',duration:6,chapter:'07 · Approfondir',title:'Vérifier ce créneau avant de décider',output:`${roadLabel} · ${view.peak.label} à examiner avec la capacité, les vitesses et une couverture plus large.`},
 ];
 return {id:'traffic',stages:trafficStages,scenes,copy:trafficCopy,subtitle:'des données aux constats',introLabel:'Contexte de l’analyse du trafic',environment:'Modèle en étoile · DAX · Power BI · données synthétiques',cardSize:{width:290,height:310},mobileCardSize:{width:270,height:290}};
}

export const trafficScenario=createTrafficScenario();
export const trafficScenes=trafficScenario.scenes;
export const trafficStarts=trafficScenes.map((_,index)=>trafficScenes.slice(0,index).reduce((total,scene)=>total+scene.duration,0));
export const trafficDuration=trafficScenes.reduce((total,scene)=>total+scene.duration,0);
