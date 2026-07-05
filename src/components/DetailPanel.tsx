import type { GraphNodeData } from '../lib/types';
import { formatBytes, formatCount, formatDuration, formatPercent } from '../lib/format';
import { getProcessorDescription } from '../lib/processorInfo';

interface DetailPanelProps {
  node: GraphNodeData | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

export function DetailPanel({ node, onClose }: DetailPanelProps) {
  if (!node) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-400">
        Select a node in the graph or table to see its full stats.
      </div>
    );
  }

  const description = getProcessorDescription(node.label);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3 text-sm">
      <div className="flex items-start justify-between">
        <h2 className="font-semibold">{node.label}</h2>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {description && (
        <p className="rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
          {description}
        </p>
      )}

      <div className="rounded border border-gray-200 p-2 dark:border-gray-700">
        <Row label="bucket" value={node.bucket} />
        <Row label="share of total" value={formatPercent(node.metricShare)} />
        <Row label="instances" value={String(node.instanceCount)} />
        {node.planStep && <Row label="plan_step" value={node.planStep} />}
        {node.hostNames.length > 0 && <Row label="host(s)" value={node.hostNames.join(', ')} />}
      </div>

      <div className="rounded border border-gray-200 p-2 dark:border-gray-700">
        <Row label="elapsed (sum)" value={formatDuration(node.elapsedUsSum)} />
        {node.instanceCount > 1 && (
          <>
            <Row label="elapsed (max)" value={formatDuration(node.elapsedUsMax)} />
            <Row label="elapsed (avg)" value={formatDuration(node.elapsedUsAvg)} />
          </>
        )}
        <Row label="input wait" value={formatDuration(node.inputWaitElapsedUsSum)} />
        <Row label="output wait" value={formatDuration(node.outputWaitElapsedUsSum)} />
      </div>

      <div className="rounded border border-gray-200 p-2 dark:border-gray-700">
        <Row label="input rows" value={formatCount(node.inputRows)} />
        <Row label="input bytes" value={formatBytes(node.inputBytes)} />
        <Row label="output rows" value={formatCount(node.outputRows)} />
        <Row label="output bytes" value={formatBytes(node.outputBytes)} />
      </div>

      {node.instanceCount > 1 && (
        <div>
          <h3 className="mb-1 font-medium text-gray-500">Instances</h3>
          <div className="flex flex-col gap-1">
            {node.members.map((m) => (
              <div
                key={m.id}
                className="flex justify-between rounded bg-gray-50 px-2 py-1 font-mono text-xs dark:bg-gray-800/50"
              >
                <span>id {m.id}</span>
                <span>{formatDuration(m.elapsedUs)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
