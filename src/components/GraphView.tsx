import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls as ReactFlowControls,
  MarkerType,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphEdgeData, GraphNodeData, MetricKey } from '../lib/types';
import { layoutGraph } from '../lib/graph/layout';
import { ProcessorNode, type ProcessorNode as ProcessorNodeType } from './ProcessorNode';

const nodeTypes = { processor: ProcessorNode };

interface GraphViewProps {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  selectedKey: string | null;
  onSelectNode: (key: string | null) => void;
  metric: MetricKey;
}

export function GraphView({ nodes, edges, selectedKey, onSelectNode, metric }: GraphViewProps) {
  const positions = useMemo(() => layoutGraph(nodes, edges), [nodes, edges]);

  const rfNodes: ProcessorNodeType[] = useMemo(
    () =>
      nodes.map((node) => {
        const pos = positions.get(node.key) ?? { x: 0, y: 0 };
        return {
          id: node.key,
          type: 'processor',
          position: pos,
          data: { node, isSelected: node.key === selectedKey, metric },
        };
      }),
    [nodes, positions, selectedKey, metric],
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: false,
        style: edge.dangling ? { stroke: '#9ca3af', strokeDasharray: '4 4' } : undefined,
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [edges],
  );

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        No processors to display yet.
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onSelectNode(node.id)}
      onPaneClick={() => onSelectNode(null)}
      fitView
      minZoom={0.1}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <ReactFlowControls />
    </ReactFlow>
  );
}
