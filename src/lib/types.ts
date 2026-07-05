// Shared types for the parsed CSV rows, the constructed graph, and
// bottleneck classification. See specification.md sections 3, 4, 5, 6.

export interface ProfileRow {
  id: string;
  parentIds: string[];
  name: string;
  planStep: string | null;
  planGroup: string | null;
  queryId: string | null;
  elapsedUs: number;
  inputWaitElapsedUs: number | null;
  outputWaitElapsedUs: number | null;
  inputRows: bigint | null;
  inputBytes: bigint | null;
  outputRows: bigint | null;
  outputBytes: bigint | null;
  eventTimeMicroseconds: string | null;
  hostName: string | null;
  raw: Record<string, string>;
}

export type BottleneckBucket = 'red' | 'yellow' | 'green';

export type MetricKey =
  | 'elapsedUs'
  | 'inputWaitElapsedUs'
  | 'outputWaitElapsedUs'
  | 'outputRows'
  | 'outputBytes';

export const METRIC_LABELS: Record<MetricKey, string> = {
  elapsedUs: 'Execution time (elapsed_us)',
  inputWaitElapsedUs: 'Input wait time',
  outputWaitElapsedUs: 'Output wait time',
  outputRows: 'Output rows',
  outputBytes: 'Output bytes',
};

export const METRIC_SHORT_LABELS: Record<MetricKey, string> = {
  elapsedUs: 'elapsed',
  inputWaitElapsedUs: 'input wait',
  outputWaitElapsedUs: 'output wait',
  outputRows: 'output rows',
  outputBytes: 'output bytes',
};

// One visual node — either a single processor instance (detail view) or
// all instances of a (plan_step, name) group (aggregated view, the default).
export interface GraphNodeData {
  key: string;
  label: string;
  instanceCount: number;
  elapsedUsSum: number;
  elapsedUsMax: number;
  elapsedUsAvg: number;
  inputWaitElapsedUsSum: number;
  outputWaitElapsedUsSum: number;
  inputRows: bigint;
  inputBytes: bigint;
  outputRows: bigint;
  outputBytes: bigint;
  planStep: string | null;
  planGroup: string | null;
  hostNames: string[];
  members: ProfileRow[];
  bucket: BottleneckBucket;
  metricShare: number;
  isPlaceholder: boolean;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  dangling?: boolean;
}

export interface BuiltGraph {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  roots: string[];
  leaves: string[];
  danglingRefs: string[];
}

export type ViewMode = 'aggregated' | 'detail';
