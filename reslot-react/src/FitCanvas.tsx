import { useEffect } from 'react';
import { useNodesInitialized, useReactFlow, useStore } from '@xyflow/react';

/** Refit when controls or the host resize the actual drawable area. */
export function FitCanvas({enabled}:{enabled:boolean}) {
 const width=useStore(state=>state.width),height=useStore(state=>state.height);
 const ready=useNodesInitialized(),{fitView}=useReactFlow();
 useEffect(()=>{
  if(!ready||!enabled||!width||!height)return;
  const frame=requestAnimationFrame(()=>void fitView({padding:.06,maxZoom:1.3,duration:0}));
  return()=>cancelAnimationFrame(frame);
 },[width,height,ready,enabled,fitView]);
 return null;
}
