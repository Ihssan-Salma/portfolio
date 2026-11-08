import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ReactFlow, ReactFlowProvider, Handle, Position, BaseEdge, getSmoothStepPath, useReactFlow, useNodesInitialized, useUpdateNodeInternals, type NodeProps, type EdgeProps } from '@xyflow/react';
import { arrange, route } from './layout';
import { FitCanvas } from './FitCanvas';
import '@xyflow/react/dist/style.css';
import { nodes as baseNodes, edges as baseEdges, beats, starts, duration, beatAt, labels, type WorkflowNode } from './scenario';
import './styles.css';
export function Component({data}:NodeProps<WorkflowNode>){
const reduced=useReducedMotion();
return <motion.div initial={false} animate={{opacity:data.revealed?1:.8,scale:data.active&&!reduced?1.025:1}} className={`component ${data.agent?'agent':''} ${data.active?'active':''}`}>
{[Position.Top,Position.Left,Position.Right].map(position=><Handle key={'in-'+position} id={'in-'+position} type="target" position={position}/>)}<span className="role">{data.role}</span><strong>{data.label}</strong><p>{data.output||(data.agent?'En attente de traitement':'Prêt')}</p>{[Position.Bottom,Position.Left,Position.Right].map(position=><Handle key={'out-'+position} id={'out-'+position} type="source" position={position}/>)}</motion.div>;
}
export function Transfer(props:EdgeProps){
const [regularPath]=getSmoothStepPath({...props,borderRadius:18,offset:28});
const {sourceX:sx,sourceY:sy,targetX:tx,targetY:ty}=props;
const lane=-60,exit=sy+30,entry=ty-30;
const path=props.data?.returnRoute?`M ${sx} ${sy} L ${sx} ${exit-10} Q ${sx} ${exit} ${sx-10} ${exit} L ${lane+10} ${exit} Q ${lane} ${exit} ${lane} ${exit+(entry>exit?10:-10)} L ${lane} ${entry+(entry>exit?-10:10)} Q ${lane} ${entry} ${lane+10} ${entry} L ${tx-10} ${entry} Q ${tx} ${entry} ${tx} ${entry+10} L ${tx} ${ty}`:regularPath;
const active=Boolean(props.data?.active),progress=Number(props.data?.progress||0);
return <><BaseEdge path={path} style={{stroke:active?(props.data?.issue?'#bd594c':'#2866d9'):'#bcc9d5',strokeWidth:active?2.8:1.2,opacity:active?1:.45}}/>{active&&<circle r="5" fill={props.data?.issue?'#bd594c':'#2866d9'} style={{offsetPath:`path('${path}')`,offsetDistance:`${progress*100}%`,filter:'drop-shadow(0 0 4px #6c9ce0)'}}/>}</>;
}
const nodeTypes={component:Component},edgeTypes={transfer:Transfer};
function Camera({index,follow,narrow,reduced}:{index:number;follow:boolean;narrow:boolean;reduced:boolean}){
const {fitView}=useReactFlow();const ready=useNodesInitialized();
useEffect(()=>{if(!ready)return;const beat=beats[index];void fitView({nodes:follow?[{id:beat.node},...(beat.from?[{id:beat.from}]:[])]:undefined,padding:.06,maxZoom:1.3,duration:reduced?0:850});},[index,follow,narrow,reduced,ready,fitView]);return null;
}
export function ReSlotWorkflow(){
const motionReduced=!!useReducedMotion();
const updateNodeInternals=useUpdateNodeInternals();
const [visible,setVisible]=useState(window.parent===window);
useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='reslot-visibility')setVisible(!!event.data.visible)};window.addEventListener('message',receive);parent.postMessage({type:'reslot-ready'},location.origin);return()=>window.removeEventListener('message',receive)},[]);
useEffect(()=>{if(visible)updateNodeInternals(baseNodes.map(node=>node.id));},[visible,updateNodeInternals]);
const [reduced,setReduced]=useState(()=>motionReduced||matchMedia('(prefers-reduced-motion: reduce)').matches);
useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
const [time,setTime]=useState(0),[playing,setPlaying]=useState(!reduced),[speed,setSpeed]=useState(1),[follow,setFollow]=useState(false),[selected,setSelected]=useState<string|null>(null),[narrow,setNarrow]=useState(window.innerWidth<650);
useEffect(()=>{const q=matchMedia('(max-width:649px)');const update=()=>setNarrow(q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
useEffect(()=>{if(reduced)setPlaying(false)},[reduced]);
const finished=time>=duration;
useEffect(()=>{if(!playing||finished||!visible)return;let last:number|undefined,raf=0;const tick=(now:number)=>{const delta=last===undefined?0:Math.min(.1,(now-last)/1000);last=now;if(!document.hidden)setTime(t=>Math.min(duration,t+delta*speed));raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[playing,speed,finished,visible]);
useEffect(()=>{if(finished)setPlaying(false)},[finished]);
const [firstResponse,setFirstResponse]=useState('decline');
const index=beatAt(time),originalBeat=beats[index],beat=index===7&&firstResponse==='timeout'?{...originalBeat,title:'Le délai de réponse est écoulé',output:'10 min écoulées (temps condensé) · offre A expirée'}:originalBeat,local=(time-starts[index])/beat.duration;
const processing=local<.35&&!reduced&&!!beat.from;
const nodes=useMemo(()=>arrange(baseNodes,narrow?3:6).map(n=>{const history=beats.slice(0,index+1).filter(b=>b.node===n.id);return {...n,measured:{width:220,height:148},data:{...n.data,revealed:reduced||history.length>0,active:beat.node===n.id,output:beat.node===n.id?(processing?'Réception des données…':beat.output):history.at(-1)?.output}}}),[index,narrow,reduced,beat.node,beat.output,processing]);
const edges=route(baseEdges.map(e=>({...e,data:{active:beat.from===e.source&&beat.node===e.target,issue:beat.issue,progress:reduced?1:Math.min(1,local/.35)}})),nodes);
const info=baseNodes.find(n=>n.id===selected);
return <main className="workflow" data-finished={finished}>
<div className="scene-heading"><span>ReSlot AI</span><span>Simulation · données fictives</span></div>
<div className="diagram"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView minZoom={.15} maxZoom={1.5} zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false} nodesDraggable={false} nodesConnectable={false} onNodeClick={(_,n)=>setSelected(n.id)} proOptions={{hideAttribution:true}}>
<FitCanvas enabled={visible&&(!follow||finished)}/><Camera index={index} follow={follow&&!finished} narrow={narrow} reduced={reduced}/></ReactFlow>
{index===0&&<motion.div className="context-scene" initial={{opacity:0}} animate={{opacity:1}}><span>Restaurant Atlas · ce soir</span><strong>19:30</strong><p>Table pour deux</p><b>Annulation reçue · créneau libre</b></motion.div>}
{info&&<aside className="inspector"><button onClick={()=>setSelected(null)} aria-label={labels.close}>×</button><span className="role">{info.data.role}</span><h3>{info.data.label}</h3><p>{info.data.detail}</p></aside>}
</div>
<div className={`scene-caption ${beat.issue?'issue':''}`} aria-live="polite"><span>{String(index+1).padStart(2,'0')} / {beats.length}</span><div><strong>{beat.title}</strong><p>{beat.output}</p></div></div>
<div className="playback" aria-label="Commandes de l’animation"><button onClick={()=>{if(finished)setTime(0);setPlaying(!playing)}}>{playing?labels.pause:labels.play}</button><button onClick={()=>{setTime(0);setPlaying(!reduced)}}>{labels.replay}</button><button disabled={index===beats.length-1} onClick={()=>setTime(starts[index+1])}>{labels.next}</button><label>{labels.speed}<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[.5,1,1.5].map(s=><option key={s} value={s}>{String(s).replace('.',',')}×</option>)}</select></label><button aria-pressed={follow} onClick={()=>setFollow(!follow)}>{follow?labels.overview:labels.follow}</button><label>Première offre<select aria-label="Réponse à la première offre" value={firstResponse} onChange={e=>setFirstResponse(e.target.value)}><option value="decline">Refus</option><option value="timeout">Expiration</option></select></label></div>
<label className="progress"><span className="sr-only">{labels.progress}</span><input aria-label={labels.progress} type="range" min="0" max={duration} step=".1" value={time} onChange={e=>{setTime(Number(e.target.value));setPlaying(false)}}/><span>{Math.floor(time)} / {duration} s</span></label>
</main>;
}
export default function App(){return <ReactFlowProvider><ReSlotWorkflow/></ReactFlowProvider>}
