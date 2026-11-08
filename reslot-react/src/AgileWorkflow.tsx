import {ReactFlowProvider} from '@xyflow/react';
import {WorkflowPlayer} from './WorkflowPlayer';
import {agileScenario} from './agile-scenario';
import type {WorkflowCopy} from './workflow-scenario';

/** Standalone default export; named export for an existing ReactFlowProvider. */
export function AgileWorkflow({copy}:{copy?:WorkflowCopy}){return <WorkflowPlayer scenario={agileScenario} copy={copy}/>}
export default function AgileApp(){return <ReactFlowProvider><AgileWorkflow/></ReactFlowProvider>}
