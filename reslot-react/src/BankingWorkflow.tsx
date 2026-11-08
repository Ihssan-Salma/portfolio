import {ReactFlowProvider} from '@xyflow/react';
import {motion} from 'motion/react';
import {WorkflowPlayer,type WorkflowVisualContext} from './WorkflowPlayer';
import {bankingScenario,rawComplaint,maskedComplaint,fictionalPassages,prepareModelPayload,sampleExtraction,samplePriority} from './banking-scenario';
import type {WorkflowCopy} from './workflow-scenario';
import './banking.css';

const modelPayload=prepareModelPayload(rawComplaint);
function Visual({stageId,time,reduced}:WorkflowVisualContext){
 if(stageId==='intake')return <div className="bank-text bank-raw"><small>CLIENT ET COMPTE FICTIFS</small><p>{rawComplaint}</p></div>;
 if(stageId==='api')return <div className="bank-trace"><span>Format de la requête <b>✓</b></span><span>Identifiant du dossier <b>C-042</b></span><small>Admission ≠ résultat du traitement</small></div>;
 if(stageId==='queue')return <div className="bank-queue"><small>API → file → worker</small><div>{[0,1,2].map(i=><motion.i key={i} initial={false} animate={{backgroundColor:i===1?'#3476c9':'#dae5ee',opacity:time>=61?.4:1}} transition={{duration:reduced?0:.4}}/>)}</div><strong>J-042 · {time>=61?'Acquitté':'En file'}</strong><small>{time>=61?'Après persistance du résultat':'202 Accepté · worker indépendant'}</small></div>;
 if(stageId==='privacy')return <div className="bank-text bank-mask"><small>MASQUAGE AVANT IA</small><p>{maskedComplaint}</p></div>;
 if(stageId==='graph')return <div className="bank-flow"><span>Contexte RAG</span><b>→</b><span>Extraction</span><b>→</b><span>Règles</span><small>Texte masqué uniquement</small></div>;
 if(stageId==='retrieval')return <div className="bank-sources">{fictionalPassages.map(source=><div key={source.id}><b>{source.id}</b><span>{source.label}</span></div>)}<small>Corpus de démonstration · non officiel</small></div>;
 if(stageId==='llama')return <div className="bank-model" data-masked={modelPayload.complaint.includes('[PERSONNE_01]')}><small>JSON SYNTHÉTIQUE · SCHÉMA VALIDÉ</small><pre>{`{
  "theme": "${sampleExtraction.theme}",
  "non_autorisee_declaree": true,
  "blocage_demande": true
}`}</pre><small>Pas de priorité décidée par le LLM</small></div>;
 if(stageId==='signals')return <div className="bank-evidence"><span>Insatisfaction exprimée</span><b>« Je suis mécontente »</b><span>Sensibilité à vérifier</span><b>« je n’ai pas autorisée »</b><small>Citations du texte fictif masqué</small></div>;
 if(stageId==='rules')return <div className="bank-rules"><span>Non autorisée déclarée <b>✓</b></span><span>ET blocage demandé <b>✓</b></span><strong>{samplePriority.priority} <small>R-DEMO-01</small></strong><small>Règle illustrative · revue humaine requise</small></div>;
 if(stageId==='record')return <div className="bank-trace"><span>PostgreSQL <b>C-042</b></span><span>Résumé <b>Masqué</b></span><span>Priorité + règle <b>P1 / R-DEMO-01</b></span><small>Références et justification conservées</small></div>;
 if(stageId==='alert')return <div className="bank-alert"><strong>! <span>P1 · revue urgente</span></strong><p>R-DEMO-01 satisfaite</p><small>Aucune action bancaire automatique</small></div>;
 if(stageId==='review')return <div className="bank-review"><svg viewBox="0 0 50 48" aria-hidden="true"><circle cx="25" cy="13" r="9" fill="#d5e5f3" stroke="#547999"/><path d="M9 44v-6c0-16 32-16 32 0v6" fill="#e5edf3" stroke="#547999"/></svg><div><strong>Analyste attendu</strong><span>Dossier et preuves à relire</span><small>Décision bancaire non exécutée</small></div></div>;
 return <div className="bank-trace bank-monitor"><small>Prometheus / Grafana · illustration</small><span>Dossier <b>Persisté et masqué</b></span><span>Alerte <b>À relire</b></span><span>Worker <b>{time>=61?'Acquitté':'En cours'}</b></span><small>Aucun indicateur de production</small></div>;
}
const renderVisual=(context:WorkflowVisualContext)=><Visual {...context}/>;
export function BankingWorkflow({copy}:{copy?:WorkflowCopy}){return <WorkflowPlayer scenario={bankingScenario} copy={copy} renderVisual={renderVisual}/>}
export default function BankingApp(){return <ReactFlowProvider><BankingWorkflow/></ReactFlowProvider>}
