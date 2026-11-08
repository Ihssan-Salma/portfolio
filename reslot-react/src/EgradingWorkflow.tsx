import {ReactFlowProvider} from '@xyflow/react';
import {WorkflowPlayer} from './WorkflowPlayer';
import {egradingStages,egradingScenes,egradingCopy} from './egrading-scenario';
import type {WorkflowDefinition,WorkflowCopy} from './workflow-scenario';
const scenario:WorkflowDefinition={id:'egrading',stages:egradingStages,scenes:egradingScenes,copy:egradingCopy,subtitle:'le parcours pédagogique',introLabel:'Contexte du devoir'};
export function EgradingWorkflow({copy}:{copy?:WorkflowCopy}){return <WorkflowPlayer scenario={scenario} copy={copy}/>}
export default function EgradingApp(){return <ReactFlowProvider><EgradingWorkflow/></ReactFlowProvider>}