import {useMemo,useState} from 'react';
import {ReactFlowProvider} from '@xyflow/react';
import {WorkflowPlayer,type WorkflowVisualContext} from './WorkflowPlayer';
import {createReslotJourney} from './scenario';
import './journeys.css';

function ReslotVisual({stageId,sceneIndex,response}:WorkflowVisualContext&{response:'decline'|'timeout'}){
 const beat=sceneIndex-1,person=beat>=8?'Sami':'Nadia',offer=beat>=9?'B':'A';
 if(stageId==='calendar')return <div className="journey-panel journey-slot"><strong>19:30 <small>Table pour deux</small></strong><span>{beat>=14?'Réservé · Sami':'Créneau libre'}</span><small>Calendar · calendrier de référence</small></div>;
 if(stageId==='sheets'||stageId==='match')return <div className="journey-panel journey-list"><span data-current={person==='Nadia'}>01 · Nadia <b>{beat>=8?'Offre A close':'Compatible'}</b></span><span data-current={person==='Sami'}>02 · Sami <b>{beat>=8?'Prioritaire':'Compatible'}</b></span><small>Consentement · deux places · 19 h 30</small></div>;
 if(stageId==='communication'||stageId==='gmail'||stageId==='response')return <div className={`journey-panel journey-offer ${beat===7?'is-issue':''}`}><small>OFFRE {offer} · SIMULATION</small><strong>{person} <span>19 h 30</span></strong><span>{beat>=14?'Confirmation simulée':beat>=11?'Acceptée · validation à suivre':beat===7?response==='timeout'?'Expirée · délai condensé':'Refusée · candidat suivant':'Une seule offre active'}</span><small>Aucun message réel envoyé</small></div>;
 if(stageId==='supervisor'||stageId==='owner')return <div className="journey-panel journey-checks"><span>Disponibilité revérifiée <b>✓</b></span><span>Version et concurrence <b>✓</b></span><span>Accord humain <b>{stageId==='owner'?'Reçu':'À obtenir'}</b></span></div>;
 if(stageId==='audit')return <div className="journey-panel journey-checks"><span>Référence <b>RS-1930</b></span><span>Offre retenue <b>B · Sami</b></span><span>Autorisation <b>Conservée</b></span><small>PostgreSQL · journal de simulation</small></div>;
 return <div className="journey-panel journey-checks"><span>Restaurant <b>Atlas</b></span><span>Événement <b>RS-1930</b></span><span>Créneau <b>19 h 30 · libre</b></span><small>Doublon et périmètre contrôlés</small></div>;
}
export function ReslotWorkflow(){
 const [response,setResponse]=useState<'decline'|'timeout'>('decline');
 const scenario=useMemo(()=>createReslotJourney(response),[response]);
 return <WorkflowPlayer scenario={scenario} renderVisual={context=><ReslotVisual {...context} response={response}/>} renderControls={()=><label className="journey-option">Première offre<select aria-label="Réponse à la première offre" value={response} onChange={event=>setResponse(event.target.value as 'decline'|'timeout')}><option value="decline">Refus</option><option value="timeout">Expiration</option></select></label>}/>;
}
export default function ReslotApp(){return <ReactFlowProvider><ReslotWorkflow/></ReactFlowProvider>}
