import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { METRIC_SHORT_LABELS, type GraphNodeData, type MetricKey } from '../lib/types';
import { formatDuration, formatCount, formatPercent, formatMetricValue } from '../lib/format';
import { metricValue } from '../lib/bottleneck/classify';

export interface ProcessorNodeData extends Record<string, unknown> {
  node: GraphNodeData;
  isSelected: boolean;
  metric: MetricKey;
}

export type ProcessorNode = Node<ProcessorNodeData, 'processor'>;

const BUCKET_STYLES = {
  red: 'bg-red-100 border-red-500 text-red-950 dark:bg-red-950/50 dark:border-red-500 dark:text-red-100',
  yellow:
    'bg-amber-100 border-amber-500 text-amber-950 dark:bg-amber-950/40 dark:border-amber-400 dark:text-amber-100',
  green:
    'bg-emerald-50 border-emerald-400 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-500 dark:text-emerald-100',
} as const;

const PLACEHOLDER_STYLE =
  'bg-gray-100 border-gray-400 border-dashed text-gray-500 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-400';

export function ProcessorNode({ data }: NodeProps<ProcessorNode>) {
  const { node, isSelected, metric } = data;
  const style = node.isPlaceholder ? PLACEHOLDER_STYLE : BUCKET_STYLES[node.bucket];
  const value = metricValue(node, metric);

  return (
    <div
      className={`w-[240px] rounded-lg border-2 px-3 py-2 shadow-sm ${style} ${
        isSelected ? 'ring-2 ring-offset-1 ring-blue-500' : ''
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium text-sm" title={node.label}>
          {node.label}
        </span>
        {node.instanceCount > 1 && (
          <span className="shrink-0 rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/10">
            ×{node.instanceCount}
          </span>
        )}
      </div>
      {!node.isPlaceholder && (
        <div className="mt-1 flex flex-col gap-0.5 text-xs opacity-90">
          <div className="flex justify-between">
            <span>{METRIC_SHORT_LABELS[metric]}</span>
            <span className="font-mono">
              {formatMetricValue(value, metric)} ({formatPercent(node.metricShare)})
            </span>
          </div>
          {metric === 'elapsedUs' && node.instanceCount > 1 && (
            <div className="flex justify-between">
              <span>max / avg</span>
              <span className="font-mono">
                {formatDuration(node.elapsedUsMax)} / {formatDuration(node.elapsedUsAvg)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>rows</span>
            <span className="font-mono">
              {formatCount(node.inputRows)} → {formatCount(node.outputRows)}
            </span>
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
}
