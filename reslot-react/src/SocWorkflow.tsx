import {useEffect,useState} from 'react';
import {ReactFlowProvider} from '@xyflow/react';
import {WorkflowPlayer,type WorkflowVisualContext} from './WorkflowPlayer';
import {socJourney,decisions} from './soc-scenario';
import './journeys.css';
function SocVisual({stageId}:WorkflowVisualContext){
 if(stageId==='logs'||stageId==='adapter'||stageId==='normalize')return <div className="journey-panel journey-logs"><strong>09:41 → 09:44 UTC</strong><div className="journey-log-row">{[0,1,2,3,4,5].map(i=><i key={i} className={i<5?'is-failed':'is-success'}/>)}</div><small>Cinq échecs SSH · une réussite · labo-01</small></div>;
 if(stageId==='evidence'||stageId==='report')return <div className="journey-panel"><div className="journey-evidence">{['E01','E02','E03','E04','E05','E06'].map(id=><b key={id}>{id}</b>)}</div><small>Sources conservées · activité ultérieure inconnue</small></div>;
 if(stageId==='alternative')return <div className="journey-panel journey-caution"><strong>Une autre explication ?</strong><span>Mot de passe corrigé par un utilisateur légitime.</span><small>Confirmation du propriétaire manquante</small></div>;
 if(stageId==='review')return <div className="journey-panel journey-caution"><strong>Décision humaine</strong><span>Classer · approfondir · escalader</span><small>Aucun blocage ni confinement automatique</small></div>;
 return <div className="journey-panel journey-caution"><strong>{stageId==='context'?'Pistes ATT&CK':'Confiance limitée'}</strong><span>Une séquence à vérifier, pas une compromission confirmée.</span><small>Hypothèses et limites documentées</small></div>;
}
function AnalystChoices({index}:{index:number}){
 const [decision,setDecision]=useState<keyof typeof decisions|null>(null);
 useEffect(()=>{if(index===0)setDecision(null)},[index]);
 if(index<11)return null;
 return <div className="journey-decisions" role="group" aria-label="Décision de l’analyste en simulation"><span>Analyste :</span>{(['dismiss','investigate','escalate'] as const).map((key,i)=><button key={key} aria-pressed={decision===key} onClick={()=>setDecision(key)}>{['Classer','Approfondir','Escalader'][i]}</button>)}{decision&&<p role="status">Choix de simulation · {decisions[decision]}</p>}</div>;
}
const renderVisual=(context:WorkflowVisualContext)=><SocVisual {...context}/>;
export function SocWorkflow(){return <WorkflowPlayer scenario={socJourney} renderVisual={renderVisual} renderControls={({sceneIndex})=><AnalystChoices index={sceneIndex}/>}/>}
export default function SocApp(){return <ReactFlowProvider><SocWorkflow/></ReactFlowProvider>}