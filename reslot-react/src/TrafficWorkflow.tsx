import {useCallback,useEffect,useMemo,useState} from 'react';
import {ReactFlowProvider} from '@xyflow/react';
import {motion} from 'motion/react';
import {WorkflowPlayer,type WorkflowVisualContext} from './WorkflowPlayer';
import {createTrafficScenario,getTrafficView,years as trafficYears,roads as trafficRoads,trafficScenes,trafficStarts,trafficDax,trafficCleaning,type Year,type RoadId} from './traffic-scenario';
import {trafficMessagesFr,type TrafficMessages} from './traffic-messages';
import type {WorkflowCopy} from './workflow-scenario';
import './traffic.css';

type Filters={year:Year;road:RoadId};
type Appearance='paper'|'dark';
const defaultFilters:Filters={year:2024,road:'TR-A'};

function Dashboard({year,road,stageId,reduced,messages:m}:Filters&Pick<WorkflowVisualContext,'stageId'|'reduced'>&{messages:TrafficMessages}){
 const view=getTrafficView(year,road),max=Math.max(...view.counts),number=new Intl.NumberFormat(m.locale);
 return <div className={`traffic-dashboard ${stageId==='peaks'?'has-peak':''}`} data-year={year} data-road={road}>
  <div className="traffic-view-heading"><span>{year} · {trafficRoads.find(item=>item.id===road)?.label}</span><span>{m.demo}</span></div>
  <div className="traffic-kpis"><div><small>{m.extractVolume}</small><strong className="traffic-volume" data-volume={view.volume}>{number.format(view.volume)}</strong></div><div className="traffic-evolution" data-available={view.evolution!==null}><small>{m.priorExtract}</small><b>{view.evolution===null?m.noReference:view.evolution.toLocaleString(m.locale,{style:'percent',maximumFractionDigits:1,signDisplay:'exceptZero'})}</b></div></div>
  <div className="traffic-bars" role="img" aria-label={`${m.chartDescription} : ${view.labels.map((label,i)=>`${label}, ${number.format(view.counts[i])} ${m.vehicles}`).join(' ; ')}`}>
   {view.counts.map((count,i)=><div key={view.labels[i]} data-count={count} className={stageId==='peaks'&&view.labels[i]===view.peak.label?'is-peak':''}><span>{view.labels[i]}</span><div><motion.i initial={false} animate={{width:`${count/max*100}%`}} transition={{duration:reduced?0:.55}}/></div><b>{number.format(count)}</b></div>)}
  </div>
  <small className="traffic-sample-note">{m.sampleNote}</small>
 </div>;
}

function StarSchema({messages:m}:{messages:TrafficMessages}){return <div className="traffic-star"><svg viewBox="0 0 250 130" role="img" aria-label={m.starDescription}>
 <g fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M58 32 C58 64 112 36 112 64"/><path d="M194 32 C194 64 146 36 146 64"/><path d="M125 112 V90"/></g>
 <g className="traffic-schema-dim"><rect x="4" y="4" width="105" height="30" rx="6"/><rect x="143" y="4" width="103" height="30" rx="6"/><rect x="74" y="105" width="103" height="24" rx="6"/></g>
 <rect className="traffic-schema-fact" x="65" y="55" width="126" height="34" rx="7"/>
 <g textAnchor="middle" fill="currentColor" fontSize="10"><text x="56" y="23">{m.calendar}</text><text x="194" y="23">{m.roadDimension}</text><text x="128" y="76">{m.trafficFacts}</text><text x="125" y="121">{m.location}</text></g>
 </svg><small>{m.grain}</small></div>}

function Visual({stageId,reduced,year,road,sceneIndex,time,messages:m}:WorkflowVisualContext&Filters&{messages:TrafficMessages}){
 const view=getTrafficView(year,road),number=new Intl.NumberFormat(m.locale);
 const branchProgress=reduced?1:Math.min(1,Math.max(0,(time-trafficStarts[sceneIndex])/1.6));
 if(['dashboard','filters','peaks','insights'].includes(stageId))return <Dashboard {...{stageId,reduced,year,road}} messages={m}/>;
 if(stageId==='sources')return <div className="traffic-source"><div className="traffic-year-files">{trafficYears.map(value=><div key={value}><svg viewBox="0 0 24 28" aria-hidden="true"><path d="M3 1h12l6 6v20H3zM15 1v7h6M7 14h10M7 18h10M7 22h7"/></svg><b>{value}</b><span>{m.csv}</span></div>)}</div><div className="traffic-mini-row"><span>{m.fictionalSections}</span><b>A + B</b></div><small>{m.noPersonalData}</small></div>;
 if(stageId==='cleaning')return <div className="traffic-cleaning"><div><span>{m.datesAndRoads}</span><b>{m.normalized}</b></div><div><span>{m.missing}</span><b>{m.excluded}</b></div><div><span>{m.duplicate}</span><b>{m.removed}</b></div><div className="traffic-warning"><span>{m.atypical}</span><b>{m.review}</b></div>{trafficScenes[sceneIndex]?.issue&&<svg className="traffic-cleaning-branch" viewBox="0 0 250 34" aria-hidden="true"><path d="M125 4C125 18 57 5 57 21" fill="none" stroke="currentColor"/><path d="M125 4C125 18 193 5 193 21" fill="none" stroke="var(--traffic-issue)"/>{['M125 4C125 18 57 5 57 21','M125 4C125 18 193 5 193 21'].map((path,i)=><circle key={path} r="2.5" fill={i?'var(--traffic-issue)':'currentColor'} style={{offsetPath:`path('${path}')`,offsetDistance:`${branchProgress*100}%`}}/>)}<text x="57" y="33" textAnchor="middle">{trafficCleaning.facts.length} {m.accepted}</text><text className="traffic-branch-issue" x="193" y="33" textAnchor="middle">{trafficCleaning.issues.length} {m.isolated}</text></svg>}<small>{m.noCause}</small></div>;
 if(stageId==='dimensions'||stageId==='facts')return <StarSchema messages={m}/>;
 return <div className="traffic-dax"><span>{m.daxMeasures}</span><code>{trafficDax.volume}</code><div><span>{m.volume}</span><b>{number.format(view.volume)}</b></div><div><span>{m.hourComparison}</span><b>{number.format(view.comparison.peak)} / {number.format(view.comparison.offPeak)}</b></div><small>{m.comparable}</small></div>;
}

function TrafficControls({filters,onManual,onDemo,demoEnabled,sceneIndex,messages:m}:{filters:Filters;onManual:(next:Filters)=>void;onDemo:(next:Filters)=>void;demoEnabled:boolean;sceneIndex:number;messages:TrafficMessages}){
 const filtersStart=trafficScenes.findIndex(scene=>scene.node==='filters'),peaksStart=trafficScenes.findIndex(scene=>scene.node==='peaks');
 useEffect(()=>{if(!demoEnabled)return;if(sceneIndex===0)onDemo(defaultFilters);else if(sceneIndex===filtersStart)onDemo({year:2023,road:'TR-B'});else if(sceneIndex===peaksStart)onDemo(defaultFilters)},[sceneIndex,demoEnabled,filtersStart,peaksStart,onDemo]);
 return <div className="traffic-controls"><label>{m.year}<select aria-label={m.yearLabel} value={filters.year} onChange={event=>onManual({...filters,year:Number(event.target.value) as Year})}>{trafficYears.map(year=><option value={year} key={year}>{year}</option>)}</select></label><label>{m.road}<select aria-label={m.roadLabel} value={filters.road} onChange={event=>onManual({...filters,road:event.target.value as RoadId})}>{trafficRoads.map(road=><option value={road.id} key={road.id}>{road.label}</option>)}</select></label></div>;
}

/** Local, reusable analytics story. No requests, real traffic data or forecast model. */
export function TrafficWorkflow({copy,appearance='paper',messages=trafficMessagesFr}:{copy?:WorkflowCopy;appearance?:Appearance;messages?:TrafficMessages}){
 const [filters,setFilters]=useState<Filters>(defaultFilters),[touched,setTouched]=useState(false);
 const manual=useCallback((next:Filters)=>{setTouched(true);setFilters(next)},[]);
 const demo=useCallback((next:Filters)=>setFilters(previous=>previous.year===next.year&&previous.road===next.road?previous:next),[]);
 const scenario=useMemo(()=>createTrafficScenario(filters.year,filters.road),[filters]);
 const renderVisual=useCallback((context:WorkflowVisualContext)=><Visual {...context} {...filters} messages={messages}/>,[filters,messages]);
 // Controls are a real component so their scene effects never run during render.
 const controls=useCallback(({sceneIndex}:{sceneIndex:number})=><TrafficControls filters={filters} onManual={manual} onDemo={demo} demoEnabled={!touched} sceneIndex={sceneIndex} messages={messages}/>,[filters,manual,demo,touched,messages]);
 return <div className={`traffic-appearance traffic-${appearance}`}><WorkflowPlayer scenario={scenario} copy={copy} renderVisual={renderVisual} renderControls={controls}/></div>;
}
export default function TrafficApp(){const appearance=new URLSearchParams(location.search).get('theme')==='dark'?'dark':'paper';return <ReactFlowProvider><TrafficWorkflow appearance={appearance}/></ReactFlowProvider>}
