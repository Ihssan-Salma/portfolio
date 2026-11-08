import {ReactFlowProvider} from '@xyflow/react';
import {motion} from 'motion/react';
import {WorkflowPlayer,type WorkflowVisualContext} from './WorkflowPlayer';
import {iotScenario,homeStateAt} from './iot-scenario';
import type {WorkflowCopy} from './workflow-scenario';
import './iot.css';

function Light({on,reduced}:{on:boolean;reduced:boolean}){
 return <svg className="iot-lamp" viewBox="0 0 220 92" role="img" aria-label={`Lumière simulée : ${on?'Allumée':'Éteinte'}`}><motion.circle cx="110" cy="35" r="31" fill="#dbe9f6" initial={false} animate={{opacity:on?.9:.1}} transition={{duration:reduced?0:.6}}/><path d="M98 52c0-9-10-13-10-25a22 22 0 0 1 44 0c0 12-10 16-10 25z" fill={on?'#a7ccef':'#d7e0e5'} stroke="#466b87" strokeWidth="1.4"/><path d="M99 57h22m-19 5h16" stroke="#466b87" strokeWidth="2" strokeLinecap="round"/><text x="110" y="84" textAnchor="middle" fill="#315d82" fontSize="11">{on?'Allumée':'Éteinte'}</text></svg>;
}
function Visual({stageId,time,reduced}:WorkflowVisualContext){
 const state=homeStateAt(time);
 if(stageId==='light')return <Light on={state.deviceLight==='Allumée'} reduced={reduced}/>;
 if(stageId==='dashboard')return <div className="iot-dashboard" data-light={state.dashboardLight}><div><span>Salon</span><b>{state.dashboardLight}</b></div><div><span>Condition simulée</span><b>21 °C</b></div><div><span>Porte</span><b>{state.door}</b></div><small>{state.denied?'Contrôle invité refusé':state.reviewed?'Notification E-009 consultée':state.notified?'Notification E-009 · Porte ouverte':state.pending?'C-017 · confirmation en attente':state.dashboardLight==='Allumée'?'C-017 · état confirmé':'Session à authentifier · démonstration'}</small></div>;
 if(stageId==='sensor')return <div className="iot-condition"><strong>21 <span>°C</span></strong><small>Valeur fixe de démonstration</small><span>Salon · aucune mesure réelle</span></div>;
 if(stageId==='door')return <svg className="iot-door" viewBox="0 0 220 92" role="img" aria-label={`Porte simulée : ${state.door}`}><path d="M81 70V9h58v61" fill="none" stroke="#6c879a" strokeWidth="2"/><motion.path initial={reduced?false:{d:'M83 10L136 10L136 68L83 68z'}} animate={{d:state.door==='Ouverte'?'M83 10L119 21L119 74L83 68z':'M83 10L136 10L136 68L83 68z'}} transition={{duration:reduced?0:.5}} fill="#dbe8f1" stroke="#466b87"/><circle cx="112" cy="44" r="2" fill="#3476c9"/><text x="110" y="88" textAnchor="middle" fontSize="11" fill="#315d82">{state.door}</text></svg>;
 if(stageId==='https')return <div className={`iot-https ${state.denied?'is-denied':''}`}><svg viewBox="0 0 40 42" aria-hidden="true"><path d="M11 18v-7a9 9 0 0 1 18 0v7" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="6" y="17" width="28" height="23" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="20" cy="27" r="2" fill="currentColor"/></svg><div><strong>HTTPS</strong><span>{state.denied?'Invité : contrôle refusé':'Résident : accès autorisé'}</span><small>Gestion sécurisée ≠ droit de contrôle</small></div></div>;
 if(stageId==='ack')return <div className="iot-ack"><span>Retour du dispositif</span><strong>C-017 <b>✓</b></strong><small>Lumière Allumée · état confirmé</small></div>;
 if(stageId==='rules')return <div className="iot-rule"><span>E-009 · Porte ouverte</span><b>↓</b><strong>Notifier le résident</strong><small>Une notification · aucune commande cachée</small></div>;
 return <div className="iot-route"><span>{stageId==='router'?'Routeur / Wi-Fi':'Passerelle IoT'}</span><div><i/>→<i/>→<i/></div><small>{stageId==='router'?'Trafic de gestion HTTPS simulé':time<32?'Consultation des états simulés':'C-017 · cible : lumière du salon'}</small></div>;
}
const renderVisual=(context:WorkflowVisualContext)=><Visual {...context}/>;
export function IotWorkflow({copy}:{copy?:WorkflowCopy}){return <WorkflowPlayer scenario={iotScenario} copy={copy} renderVisual={renderVisual}/>}
export default function IotApp(){return <ReactFlowProvider><IotWorkflow/></ReactFlowProvider>}
