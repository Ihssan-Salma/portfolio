import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from './scenario';

// Alternating rows keep each consecutive connection in an empty corridor.
export function arrange(nodes: WorkflowNode[], columns = 6): WorkflowNode[] {
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns), column = index % columns;
    return {...node, position: {x: (row % 2 ? columns - 1 - column : column) * 250, y: row * 210}};
  });
}
export function route(edges: Edge[], nodes: WorkflowNode[]): Edge[] {
  return edges.map(edge => {
    const source = nodes.find(node => node.id === edge.source)!;
    const target = nodes.find(node => node.id === edge.target)!;
    const sameRow = source.position.y === target.position.y;
    const forward = target.position.x > source.position.x;
    const adjacent = Math.abs(nodes.indexOf(source) - nodes.indexOf(target)) === 1;
    return {...edge, sourceHandle: adjacent && sameRow ? (forward ? 'out-right' : 'out-left') : 'out-bottom',
      targetHandle: adjacent && sameRow ? (forward ? 'in-left' : 'in-right') : 'in-top',
      hidden: !adjacent && !edge.data?.active,
      data: {...edge.data, returnRoute: !adjacent}};
  });
}
