import dagre from '@dagrejs/dagre';
import type { GraphEdgeData, GraphNodeData } from '../types';

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 110;

export interface LayoutPosition {
  x: number;
  y: number;
}

// Assigns x/y positions via dagre's hierarchical layout. See
// specification.md §7.1 — left-to-right reads best for the typical wide,
// shallow pipeline shape.
export function layoutGraph(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
): Map<string, LayoutPosition> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 32, ranksep: 96 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.key, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(g);

  const positions = new Map<string, LayoutPosition>();
  for (const node of nodes) {
    const pos = g.node(node.key);
    positions.set(node.key, {
      x: pos.x - NODE_WIDTH / 2,
      y: pos.y - NODE_HEIGHT / 2,
    });
  }
  return positions;
}
