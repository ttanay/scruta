import type { BuiltGraph, GraphEdgeData, GraphNodeData, ProfileRow } from '../types';

function nodeFromRow(row: ProfileRow): GraphNodeData {
  return {
    key: row.id,
    label: row.name,
    instanceCount: 1,
    elapsedUsSum: row.elapsedUs,
    elapsedUsMax: row.elapsedUs,
    elapsedUsAvg: row.elapsedUs,
    inputWaitElapsedUsSum: row.inputWaitElapsedUs ?? 0,
    outputWaitElapsedUsSum: row.outputWaitElapsedUs ?? 0,
    inputRows: row.inputRows ?? 0n,
    inputBytes: row.inputBytes ?? 0n,
    outputRows: row.outputRows ?? 0n,
    outputBytes: row.outputBytes ?? 0n,
    planStep: row.planStep,
    planGroup: row.planGroup,
    hostNames: row.hostName ? [row.hostName] : [],
    members: [row],
    bucket: 'green',
    metricShare: 0,
    isPlaceholder: false,
  };
}

function placeholderNode(id: string): GraphNodeData {
  return {
    key: id,
    label: '(missing processor)',
    instanceCount: 0,
    elapsedUsSum: 0,
    elapsedUsMax: 0,
    elapsedUsAvg: 0,
    inputWaitElapsedUsSum: 0,
    outputWaitElapsedUsSum: 0,
    inputRows: 0n,
    inputBytes: 0n,
    outputRows: 0n,
    outputBytes: 0n,
    planStep: null,
    planGroup: null,
    hostNames: [],
    members: [],
    bucket: 'green',
    metricShare: 0,
    isPlaceholder: true,
  };
}

// Builds the raw per-processor-instance DAG from parsed CSV rows.
// Edges point producer -> consumer (id -> each of its parent_ids), per
// specification.md §4.2. Roots are rows with empty parent_ids (sinks);
// leaves are ids that never appear inside any row's parent_ids (sources).
export function buildGraph(rows: ProfileRow[]): BuiltGraph {
  const nodeByKey = new Map<string, GraphNodeData>();
  for (const row of rows) {
    nodeByKey.set(row.id, nodeFromRow(row));
  }

  const referencedAsParent = new Set<string>();
  const danglingRefs = new Set<string>();
  const edgeByKey = new Map<string, GraphEdgeData>();

  for (const row of rows) {
    for (const parentId of row.parentIds) {
      referencedAsParent.add(parentId);
      if (!nodeByKey.has(parentId)) {
        danglingRefs.add(parentId);
        nodeByKey.set(parentId, placeholderNode(parentId));
      }
      const edgeId = `${row.id}->${parentId}`;
      edgeByKey.set(edgeId, {
        id: edgeId,
        source: row.id,
        target: parentId,
        dangling: danglingRefs.has(parentId),
      });
    }
  }

  const roots: string[] = [];
  const leaves: string[] = [];
  for (const row of rows) {
    if (row.parentIds.length === 0) roots.push(row.id);
    if (!referencedAsParent.has(row.id)) leaves.push(row.id);
  }

  return {
    nodes: Array.from(nodeByKey.values()),
    edges: Array.from(edgeByKey.values()),
    roots,
    leaves,
    danglingRefs: Array.from(danglingRefs),
  };
}
