import type { GraphNodeData, MetricKey } from '../types';

export interface ClassifyThresholds {
  redShare: number;
  yellowShare: number;
}

export const DEFAULT_THRESHOLDS: ClassifyThresholds = {
  redShare: 0.2,
  yellowShare: 0.05,
};

export function metricValue(node: GraphNodeData, metric: MetricKey): number {
  switch (metric) {
    case 'elapsedUs':
      return node.elapsedUsSum;
    case 'inputWaitElapsedUs':
      return node.inputWaitElapsedUsSum;
    case 'outputWaitElapsedUs':
      return node.outputWaitElapsedUsSum;
    case 'outputRows':
      return Number(node.outputRows);
    case 'outputBytes':
      return Number(node.outputBytes);
  }
}

// Classifies nodes into red/yellow/green by their share of the total
// metric value across all visible nodes (not by percentile-of-node-count).
// The single largest node is always red, so there's always a clear answer
// to "what's the bottleneck" even in a flat/uniform graph. See
// specification.md §6.2 for the rationale and caveats.
export function classify(
  nodes: GraphNodeData[],
  metric: MetricKey,
  thresholds: ClassifyThresholds = DEFAULT_THRESHOLDS,
): GraphNodeData[] {
  if (nodes.length === 0) return nodes;

  const values = nodes.map((n) => metricValue(n, metric));
  const total = values.reduce((a, b) => a + b, 0);

  let maxValue = -Infinity;
  let maxIndex = -1;
  values.forEach((v, i) => {
    if (v > maxValue) {
      maxValue = v;
      maxIndex = i;
    }
  });

  return nodes.map((node, i) => {
    const value = values[i];
    const share = total > 0 ? value / total : 0;
    const bucket =
      i === maxIndex && value > 0
        ? 'red'
        : share >= thresholds.redShare
          ? 'red'
          : share >= thresholds.yellowShare
            ? 'yellow'
            : 'green';
    return { ...node, metricShare: share, bucket };
  });
}
