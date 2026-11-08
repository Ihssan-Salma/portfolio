import {ReactFlowProvider} from '@xyflow/react';
import {motion} from 'motion/react';
import {WorkflowPlayer,type WorkflowVisualContext} from './WorkflowPlayer';
import {facialScenario,facialStarts,expressionClasses,exampleScores,weakScores,sequenceScores,smoothedScores,topClass,illustrativeThreshold} from './facial-scenario';
import type {WorkflowCopy} from './workflow-scenario';
import './facial.css';

function SyntheticFace({detected=false,crop=false,label,weak=false}:{detected?:boolean;crop?:boolean;label?:string;weak?:boolean}){
 return <svg className="fd-face" viewBox="0 0 230 104" role="img" aria-label="Visage vectoriel entièrement synthétique, sans identité réelle">
  <rect x="1" y="1" width="228" height="102" rx="7" fill={crop?'#e4e6e5':'#edf1f1'}/>
  <path d="M57 102 Q65 77 115 77 Q165 77 173 102" fill="#c7d4db"/>
  <ellipse cx="115" cy="48" rx="30" ry="37" fill={crop?'#c5c9cc':'#e3d9cf'}/>
  <path d="M99 40h9m14 0h9M115 46l-3 11h6M103 66q12 9 24 0" fill="none" stroke="#456075" strokeWidth="2" strokeLinecap="round"/>
  {crop&&Array.from({length:9},(_,i)=><path key={i} d={`M${79+i*9} 8v80 M79 ${8+i*10}h72`} stroke="#fff" opacity=".16"/>)}
  {detected&&<rect x="78" y="6" width="74" height="84" rx="4" fill="none" stroke={weak?'#b95b4d':'#3476c9'} strokeWidth="1.5"/>}
  {label&&<><rect x="4" y="82" width="222" height="18" rx="3" fill="#fffdf8"/><text x="115" y="94" textAnchor="middle" fill={weak?'#a85246':'#275b8f'} fontSize="9">{label}</text></>}
  {!label&&<text x="8" y="96" fill="#62798a" fontSize="8">{crop?'48 × 48 · niveaux de gris':'SYNTHÉTIQUE · aucune caméra'}</text>}
 </svg>;
}
function Scores({weak,reduced}:{weak:boolean;reduced:boolean}){
 const scores=weak?weakScores:exampleScores;
 return <div className="fd-scores" aria-label="Distribution de sept scores synthétiques">{expressionClasses.map((label,i)=><div key={label}><span>{label}</span><span className="fd-bar"><motion.i initial={reduced?false:{width:0}} animate={{width:`${scores[i]*100}%`}} transition={{duration:reduced?0:.5}}/></span><b>{Math.round(scores[i]*100)} %</b></div>)}</div>;
}
function Evaluation({matrix}:{matrix:boolean}){
 if(!matrix)return <div className="fd-evaluation"><strong>F1 par classe</strong><span>Précision ↔ Rappel</span><p>Valeurs : non renseignées</p><small>Mesures sur un jeu de test distinct</small></div>;
 return <div className="fd-matrix" role="img" aria-label="Matrice de confusion conceptuelle : diagonale pour les accords, autres cases pour les désaccords ; aucune mesure"><div>{Array.from({length:49},(_,i)=><i key={i} className={Math.floor(i/7)===i%7?'is-diagonal':i===19?'is-disagreement':''}/>)}</div><p><b>Annotations ↔ Prédictions</b><span>Diagonale : accords</span><span>Autres cases : désaccords</span><small>Schéma · aucune mesure</small></p></div>;
}
function Visual({stageId,sceneIndex,time,reduced}:WorkflowVisualContext){
 const weak=sceneIndex>=8&&sceneIndex<=10;
 if(stageId==='frame'||stageId==='detection'||stageId==='preprocess')return <SyntheticFace detected={stageId==='detection'} crop={stageId==='preprocess'}/>;
 if(stageId==='cnn')return <div className="fd-network" aria-label="Schéma conceptuel du CNN, sans architecture exacte"><span>Pixels</span><i>→</i><span>Caractéristiques</span><i>→</i><span>7 sorties</span><small>TensorFlow / Keras · modèle illustré</small></div>;
 if(stageId==='scores')return <Scores weak={weak} reduced={reduced}/>;
 if(stageId==='confidence')return <div className={`fd-confidence ${weak?'is-weak':''}`}><strong>{weak?'22 %':'64 %'}</strong><span>Score maximal synthétique</span><div><i style={{left:`${illustrativeThreshold*100}%`}}/><b style={{left:weak?'22%':'64%'}}/></div><small>Seuil illustratif : 45 % · non calibré</small></div>;
 if(stageId==='smoothing'){
  const current=reduced?4:Math.min(4,Math.max(0,Math.floor(time-facialStarts[11])));
  return <div className="fd-smoothing"><div><span>Brut</span>{sequenceScores.map((scores,i)=><b key={i} data-current={i===current}>{topClass(scores)===3?'J':'S'}</b>)}</div><div><span>Lissé</span>{smoothedScores.map((scores,i)=><b key={i} data-current={i===current}>{topClass(scores)===3?'J':'S'}</b>)}</div><small>J : classe joie · S : classe surprise</small><p>F-0{44+current} · score lissé {Math.round(smoothedScores[current][3]*100)} %</p></div>;
 }
 if(stageId==='overlay')return <SyntheticFace detected weak={weak} label={weak?'Indéterminé · sans catégorie':sceneIndex>=12?'Classe « joie » · score lissé 59 %':'Classe « joie » · score 64 %'}/>;
 if(stageId==='evaluation')return <Evaluation matrix={sceneIndex>=15}/>;
 return null;
}
const renderVisual=(context:WorkflowVisualContext)=><Visual {...context}/>;
export function FacialWorkflow({copy}:{copy?:WorkflowCopy}){return <WorkflowPlayer scenario={facialScenario} copy={copy} renderVisual={renderVisual}/>}
export default function FacialApp(){return <ReactFlowProvider><FacialWorkflow/></ReactFlowProvider>}
