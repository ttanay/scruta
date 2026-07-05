import { useMemo, useState } from 'react';
import type { GraphNodeData, MetricKey } from '../lib/types';
import { metricValue } from '../lib/bottleneck/classify';
import { formatDuration, formatPercent } from '../lib/format';

interface NodeTableProps {
  nodes: GraphNodeData[];
  metric: MetricKey;
  selectedKey: string | null;
  onSelectNode: (key: string) => void;
}

const BUCKET_DOT = {
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-400',
} as const;

export function NodeTable({ nodes, metric, selectedKey, onSelectNode }: NodeTableProps) {
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = useMemo(() => {
    const withValue = nodes.map((n) => ({ node: n, value: metricValue(n, metric) }));
    withValue.sort((a, b) => (sortDesc ? b.value - a.value : a.value - b.value));
    return withValue;
  }, [nodes, metric, sortDesc]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-white dark:bg-gray-900">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-2 py-1 font-medium"></th>
            <th className="px-2 py-1 font-medium">Processor</th>
            <th
              className="cursor-pointer px-2 py-1 font-medium select-none"
              onClick={() => setSortDesc((v) => !v)}
            >
              Value {sortDesc ? '▼' : '▲'}
            </th>
            <th className="px-2 py-1 font-medium">Share</th>
          </tr>
        </thead>
      </table>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <tbody>
            {sorted.map(({ node, value }) => (
              <tr
                key={node.key}
                className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${
                  node.key === selectedKey ? 'bg-blue-50 dark:bg-blue-950/40' : ''
                }`}
                onClick={() => onSelectNode(node.key)}
              >
                <td className="w-6 px-2 py-1">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${BUCKET_DOT[node.bucket]}`} />
                </td>
                <td className="px-2 py-1 truncate max-w-[160px]" title={node.label}>
                  {node.label}
                  {node.instanceCount > 1 && (
                    <span className="ml-1 text-gray-400">×{node.instanceCount}</span>
                  )}
                </td>
                <td className="px-2 py-1 font-mono">
                  {metric === 'elapsedUs' || metric === 'inputWaitElapsedUs' || metric === 'outputWaitElapsedUs'
                    ? formatDuration(value)
                    : value.toLocaleString()}
                </td>
                <td className="px-2 py-1 font-mono">{formatPercent(node.metricShare)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
