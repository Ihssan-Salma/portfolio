import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {motion} from 'motion/react';
import {ReactFlow,ReactFlowProvider,Handle,Position,BaseEdge,useReactFlow,useNodesInitialized,useStore,type Node,type NodeProps,type EdgeProps,type Edge} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type {WorkflowDefinition,WorkflowStage,WorkflowScene,WorkflowCopy} from './workflow-scenario';
import './egrading.css';

type Copy=WorkflowCopy;
type CardData=WorkflowStage&{[key:string]:unknown;active:boolean;revealed:boolean;output:string;status:string;reduced:boolean;visual?:ReactNode;width:number;height:number};
export type WorkflowVisualContext={stageId:string;sceneIndex:number;time:number;reduced:boolean};
type WorkflowControlsContext={sceneIndex:number;time:number;reduced:boolean};
type CardNode=Node<CardData>;
function StageCard({data}:NodeProps<CardNode>){
 return <motion.div className={`eg-card ${data.active?'is-active':''} ${data.exception?'is-exception':''}`} style={{width:data.width,height:data.height}} initial={false} animate={{opacity:data.revealed?1:.22,boxShadow:data.active?(data.exception?'0 0 0 4px #ffffff13':'0 0 0 4px #cc00ff13'):'0 4px 16px #000000'}} transition={{duration:data.reduced?0:.45}}>
  <Handle type="target" position={Position.Left}/><span className="eg-role">{data.boundary?`${data.boundary} · `:''}{data.role}</span><strong>{data.label}</strong>{data.visual}<p>{data.output}</p><span className="eg-status"><i/>{data.status}</span><Handle type="source" position={Position.Right}/>
 </motion.div>;
}
function DataEdge(props:EdgeProps){
 const {sourceX:sx,sourceY:sy,targetX:tx,targetY:ty,data}=props;
 const turn=tx<sx,offset=Math.max(50,Math.abs(tx-sx)*.48),lane=Number(data?.lane??110);
 const path=turn?`M${sx},${sy} C${sx+65},${sy} ${sx+65},${sy+lane} ${sx},${sy+lane} L${tx},${sy+lane} C${tx-65},${sy+lane} ${tx-65},${ty} ${tx},${ty}`:`M${sx},${sy} C${sx+offset},${sy} ${tx-offset},${ty} ${tx},${ty}`;
 const color=data?.issue?'#ffffff':'#cc00ff',active=!!data?.active;
 return <><BaseEdge path={path} label={active?data?.contract as string:undefined} labelX={(sx+tx)/2} labelY={turn?sy+lane:(sy+ty)/2-12} labelStyle={{fontSize:10,fill:color}} labelBgStyle={{fill:'#000000'}} labelBgPadding={[6,4]} labelBgBorderRadius={4} style={{stroke:active?color:'#ffffff60',strokeWidth:active?2.5:1.2,strokeDasharray:data?.issue?'5 4':undefined,opacity:active?1:.45}}/>{active&&<circle className="eg-token" r="5" fill={color} style={{offsetPath:`path('${path}')`,offsetDistance:`${Number(data?.progress??0)*100}%`}}/>}</>;
}
function Boundary({data}:NodeProps<CardNode>){return <div className="eg-boundary-label">{data.label}<span>Service + base privée</span></div>}
const nodeTypes={egrading:StageCard,boundary:Boundary},edgeTypes={data:DataEdge};
function Camera({index,follow,visible,reduced,scenes}:{index:number;follow:boolean;visible:boolean;reduced:boolean;scenes:WorkflowScene[]}){
 const {fitView}=useReactFlow(),ready=useNodesInitialized(),width=useStore(s=>s.width),height=useStore(s=>s.height);
 useEffect(()=>{if(!ready||!visible||!width||!height)return;const scene=scenes[index];const ids=follow&&scene.node?[scene.node,...(scene.from&&width>=850?[scene.from]:[])]:undefined;
 const frame=requestAnimationFrame(()=>void fitView({nodes:ids?.map(id=>({id})),padding:follow?.12:.2,minZoom:follow?.08:.03,maxZoom:width<500?1:1.15,duration:reduced?0:650}));return()=>cancelAnimationFrame(frame);
 },[index,follow,visible,reduced,ready,width,height,fitView,scenes]);return null;
}

/** Deterministic local workflow player shared by portfolio scenarios. */
export function WorkflowPlayer({scenario,copy=scenario.copy,renderVisual,renderControls}:{scenario:WorkflowDefinition;copy?:Copy;renderVisual?:(context:WorkflowVisualContext)=>ReactNode;renderControls?:(context:WorkflowControlsContext)=>ReactNode}){
 const {stages,scenes,id,introLabel}=scenario;
 const starts=useMemo(()=>scenes.map((_,i)=>scenes.slice(0,i).reduce((sum,scene)=>sum+scene.duration,0)),[scenes]);
 const duration=useMemo(()=>scenes.reduce((sum,scene)=>sum+scene.duration,0),[scenes]);
 const sceneAt=(time:number)=>starts.reduce((last,start,i)=>time>=start?i:last,0);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches),[speed,setSpeed]=useState(1),[follow,setFollow]=useState(true),[selected,setSelected]=useState<string|null>(null);
 const [visible,setVisible]=useState(window.parent===window),[narrow,setNarrow]=useState(window.innerWidth<600);
 const cardSize=(narrow?scenario.mobileCardSize:undefined)??scenario.cardSize;
 const width=cardSize?.width??250,height=cardSize?.height??180;
 const player=useRef<HTMLElement>(null);
 const detailsButton=useRef<HTMLButtonElement>(null),lastNode=useRef<HTMLElement|null>(null);
 useEffect(()=>{const media=matchMedia('(max-width:599px)'),resize=()=>setNarrow(media.matches);media.addEventListener('change',resize);return()=>media.removeEventListener('change',resize)},[]);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type===id+'-visibility')setVisible(!!event.data.visible)};window.addEventListener('message',receive);parent.postMessage({type:id+'-ready'},location.origin);return()=>window.removeEventListener('message',receive)},[id]);
 useEffect(()=>{if(!reduced)return;setPlaying(false);const frame=requestAnimationFrame(()=>player.current?.getAnimations({subtree:true}).forEach(animation=>animation.finish()));return()=>cancelAnimationFrame(frame)},[reduced]);
 const finished=time>=duration,index=sceneAt(time),scene=scenes[index],local=(time-starts[index])/scene.duration,token=reduced?1:Math.min(1,local/.32);
 useEffect(()=>{if(!playing||finished||!visible)return;let previous:number|undefined,frame=0;const tick=(now:number)=>{const delta=previous===undefined?0:(now-previous)/1000;previous=now;if(!document.hidden)setTime(t=>Math.min(duration,t+delta*speed));frame=requestAnimationFrame(tick)};const resetClock=()=>{previous=undefined};document.addEventListener('visibilitychange',resetClock);frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resetClock)}},[playing,finished,visible,speed]);
 useEffect(()=>{if(finished)setPlaying(false)},[finished]);
 useEffect(()=>{if(selected)detailsButton.current?.focus()},[selected]);
 const partial=copy.partial??'Partiel';
 const phase=token<1?copy.receiving:scene.issue?copy.blocked:scene.state==='partial'?partial:local<.7?copy.processing:copy.done;
 const nodes:CardNode[]=useMemo(()=>{
 const cards:CardNode[]=stages.map((stage,i)=>{
  const columns=narrow?2:3,row=Math.floor(i/columns),column=i%columns;
  const history=scenes.slice(0,index+1).filter(s=>s.node===stage.id),active=scene.node===stage.id;
  return {id:stage.id,type:'egrading',position:(narrow?stage.mobilePosition:stage.position)??{x:(row%2?columns-1-column:column)*(width+60),y:row*(height+65)},measured:{width,height},ariaLabel:`${stage.label} : ${copy.details}`,data:{...stage,exception:stage.exception||!!(active?scene.issue:history.at(-1)?.issue),width,height,visual:active?renderVisual?.({stageId:stage.id,sceneIndex:index,time,reduced}):undefined,active,revealed:reduced||history.length>0,reduced,output:active&&token<1?copy.receiving+'…':history.at(-1)?.output??'',status:active?phase:history.length?(history.at(-1)?.state==='partial'?partial:history.at(-1)?.issue||stage.exception?copy.blocked:copy.done):copy.waiting}};
 });
 const groups:CardNode[]=[...new Set(stages.map(stage=>stage.boundary).filter(Boolean))].map(boundary=>{
  const members=cards.filter(card=>card.data.boundary===boundary),x=Math.min(...members.map(card=>card.position.x))-14,y=Math.min(...members.map(card=>card.position.y))-34;
  const groupWidth=Math.max(...members.map(card=>card.position.x))+width+14-x,groupHeight=Math.max(...members.map(card=>card.position.y))+height+14-y;
  return {id:`boundary-${boundary}`,type:'boundary',position:{x,y},measured:{width:groupWidth,height:groupHeight},style:{width:groupWidth,height:groupHeight,border:'1px solid #ffffff30',borderRadius:16,background:'#ffffff05'},zIndex:-1,selectable:false,focusable:false,ariaLabel:`${boundary} : service et base PostgreSQL distincte`,data:{id:`boundary-${boundary}`,label:boundary!,role:'',detail:'',active:false,revealed:true,output:'',status:'',reduced,width:groupWidth,height:groupHeight}};
 });
 return [...groups,...cards];
 },[stages,scenes,narrow,index,scene.node,reduced,token<1,phase,copy,partial,width,height,renderVisual,renderVisual?time:0]);
 const edges:Edge[]=scenes.filter(s=>s.from).map((s,i)=>({id:`${s.from}-${s.node}-${i}`,source:s.from!,target:s.node!,type:'data',hidden:!reduced&&!scenes.slice(0,index+1).includes(s),data:{active:scene===s,issue:s.issue,progress:token,contract:s.contract,lane:height/2+20}}));
 const info=stages.find(stage=>stage.id===selected);
 const close=()=>{setSelected(null);lastNode.current?.focus()};
 const replay=()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)').matches;setReduced(preference);setTime(0);setPlaying(!preference)};
 return <main ref={player} className="eg-player" data-finished={finished}>
  <div className="eg-canvas">
   <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView minZoom={.03} maxZoom={1.3} nodesDraggable={false} nodesConnectable={false} zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false} preventScrolling={false} onNodeClick={(event,node)=>{lastNode.current=event.currentTarget as HTMLElement;setSelected(node.id)}} proOptions={{hideAttribution:true}}>
    <Camera index={index} follow={follow} visible={visible} reduced={reduced} scenes={scenes}/>
   </ReactFlow>
   {index===0&&<motion.section className="eg-intro" initial={{opacity:reduced?1:0}} animate={{opacity:1}} transition={{duration:reduced?0:.5}} aria-label={introLabel}><span className="eg-eyebrow">{copy.course}</span><h1>{copy.assignment}</h1><p>{copy.intro}</p><div className="eg-roles">{copy.roles.map((role,i)=><span key={role}><b>0{i+1}</b>{role}</span>)}</div><small>{copy.deadline}</small></motion.section>}
   {info&&<aside className="eg-inspector" aria-label={copy.details} onKeyDown={e=>{if(e.key==='Escape')close()}}><button ref={detailsButton} onClick={close} aria-label={copy.close}>×</button><span className="eg-eyebrow">{info.role}</span><h2>{info.label}</h2><p>{info.detail}</p></aside>}
  </div>
  <section className={`eg-caption ${scene.issue?'is-issue':''}`} aria-live="polite" aria-atomic="true"><div><h2>{scene.title}</h2><p>{scene.output}</p></div>{finished&&<b aria-label="Lecture terminée">✓</b>}</section>
  <div className="eg-controls" role="group" aria-label={`Commandes de lecture ${copy.title}`}>
   <button className="eg-primary" onClick={()=>{if(finished)setTime(0);setPlaying(finished||!playing)}}>{playing&&!finished?copy.pause:copy.play}</button><button onClick={replay}>{copy.replay}</button><button disabled={finished} onClick={()=>{setTime(index===scenes.length-1?duration:starts[index+1])}}>{copy.next}</button>
   <label>{copy.speed}<select aria-label={copy.speed} value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[.5,1,1.5].map(value=><option value={value} key={value}>{String(value).replace('.',',')}×</option>)}</select></label><button aria-pressed={follow} onClick={()=>setFollow(!follow)}>{follow?copy.overview:copy.follow}</button>
   {renderControls?.({sceneIndex:index,time,reduced})}
  </div>
  <label className="eg-progress"><input aria-label={copy.progress} aria-valuetext={`${Math.floor(time)} secondes sur ${duration} · ${scene.title}`} type="range" min={0} max={duration} step={.1} value={time} onChange={e=>{setTime(Number(e.target.value));setPlaying(false)}}/><span>{Math.floor(time)} / {duration} s</span></label>
  <small className="eg-notice">{copy.notice}</small>
 </main>;
}
export default function WorkflowPlayerApp({scenario}:{scenario:WorkflowDefinition}){return <ReactFlowProvider><WorkflowPlayer scenario={scenario}/></ReactFlowProvider>}
