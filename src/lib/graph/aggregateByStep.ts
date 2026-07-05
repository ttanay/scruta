import type { BuiltGraph, GraphEdgeData, GraphNodeData } from '../types';

function aggregationKey(node: GraphNodeData): string {
  if (node.isPlaceholder) return `missing:${node.key}`;
  return `${node.planStep ?? 'unknown'}:${node.label}`;
}

// Collapses the raw per-instance graph into one node per (plan_step, name)
// group, combining parallel thread instances (`plan_group`). See
// specification.md §5. Sum reflects total work done by the step; max/avg
// surface skew across instances.
export function aggregateByStep(graph: BuiltGraph): BuiltGraph {
  const groups = new Map<string, GraphNodeData[]>();
  for (const node of graph.nodes) {
    const key = aggregationKey(node);
    const list = groups.get(key);
    if (list) {
      list.push(node);
    } else {
      groups.set(key, [node]);
    }
  }

  const keyRemap = new Map<string, string>();
  const aggregatedNodes: GraphNodeData[] = [];

  for (const [aggKey, members] of groups) {
    for (const m of members) keyRemap.set(m.key, aggKey);

    const elapsedValues = members.map((m) => m.elapsedUsSum);
    const elapsedSum = elapsedValues.reduce((a, b) => a + b, 0);
    const elapsedMax = elapsedValues.length ? Math.max(...elapsedValues) : 0;
    const isPlaceholder = members.every((m) => m.isPlaceholder);

    aggregatedNodes.push({
      key: aggKey,
      label: members[0].label,
      instanceCount: members.reduce((a, m) => a + m.instanceCount, 0),
      elapsedUsSum: elapsedSum,
      elapsedUsMax: elapsedMax,
      elapsedUsAvg: members.length ? elapsedSum / members.length : 0,
      inputWaitElapsedUsSum: members.reduce((a, m) => a + m.inputWaitElapsedUsSum, 0),
      outputWaitElapsedUsSum: members.reduce((a, m) => a + m.outputWaitElapsedUsSum, 0),
      inputRows: members.reduce((a, m) => a + m.inputRows, 0n),
      inputBytes: members.reduce((a, m) => a + m.inputBytes, 0n),
      outputRows: members.reduce((a, m) => a + m.outputRows, 0n),
      outputBytes: members.reduce((a, m) => a + m.outputBytes, 0n),
      planStep: members[0].planStep,
      planGroup: null,
      hostNames: Array.from(new Set(members.flatMap((m) => m.hostNames))),
      members: members.flatMap((m) => m.members),
      bucket: 'green',
      metricShare: 0,
      isPlaceholder,
    });
  }

  const edgeByKey = new Map<string, GraphEdgeData>();
  for (const edge of graph.edges) {
    const source = keyRemap.get(edge.source) ?? edge.source;
    const target = keyRemap.get(edge.target) ?? edge.target;
    if (source === target) continue; // instances within the same step feeding each other
    const id = `${source}->${target}`;
    if (!edgeByKey.has(id)) {
      edgeByKey.set(id, { id, source, target, dangling: edge.dangling });
    }
  }

  const roots = Array.from(new Set(graph.roots.map((r) => keyRemap.get(r) ?? r)));
  const leaves = Array.from(new Set(graph.leaves.map((l) => keyRemap.get(l) ?? l)));

  return {
    nodes: aggregatedNodes,
    edges: Array.from(edgeByKey.values()),
    roots,
    leaves,
    danglingRefs: graph.danglingRefs,
  };
}
