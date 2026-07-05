import { METRIC_LABELS, type MetricKey, type ViewMode } from '../lib/types';
import type { ClassifyThresholds } from '../lib/bottleneck/classify';
import { HelpGuide } from './HelpGuide';

interface ControlsProps {
  metric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  thresholds: ClassifyThresholds;
  onThresholdsChange: (thresholds: ClassifyThresholds) => void;
  onReset: () => void;
}

export function Controls({
  metric,
  onMetricChange,
  viewMode,
  onViewModeChange,
  thresholds,
  onThresholdsChange,
  onReset,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 p-3 text-sm dark:border-gray-700">
      <label className="flex items-center gap-2" title="What 'cost' means for ranking and coloring nodes">
        <span className="text-gray-500">Metric</span>
        <select
          className="rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-700"
          style={{ colorScheme: 'dark' }}
          value={metric}
          onChange={(e) => onMetricChange(e.target.value as MetricKey)}
        >
          {Object.entries(METRIC_LABELS).map(([key, label]) => (
            <option key={key} value={key} className="bg-gray-800 text-gray-100">
              {label}
            </option>
          ))}
        </select>
      </label>

      <div
        className="flex items-center gap-1 rounded border border-gray-300 p-0.5 dark:border-gray-700"
        title="By step groups parallel thread instances together; Per instance shows every thread separately"
      >
        {(['aggregated', 'detail'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`rounded px-2 py-1 text-xs capitalize ${
              viewMode === mode
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            onClick={() => onViewModeChange(mode)}
          >
            {mode === 'aggregated' ? 'By step' : 'Per instance'}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2" title="Nodes at or above this share of the total are colored red">
        <span className="text-gray-500">Red ≥</span>
        <input
          type="number"
          min={1}
          max={100}
          step={1}
          className="w-16 rounded border border-gray-300 bg-transparent px-1 py-0.5 dark:border-gray-700"
          value={Math.round(thresholds.redShare * 100)}
          onChange={(e) =>
            onThresholdsChange({ ...thresholds, redShare: Number(e.target.value) / 100 })
          }
        />
        <span className="text-gray-500">%</span>
      </label>

      <label className="flex items-center gap-2" title="Nodes at or above this share of the total are colored yellow">
        <span className="text-gray-500">Yellow ≥</span>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          className="w-16 rounded border border-gray-300 bg-transparent px-1 py-0.5 dark:border-gray-700"
          value={Math.round(thresholds.yellowShare * 100)}
          onChange={(e) =>
            onThresholdsChange({ ...thresholds, yellowShare: Number(e.target.value) / 100 })
          }
        />
        <span className="text-gray-500">%</span>
      </label>

      <div className="ml-auto flex items-center gap-3">
        <HelpGuide />
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          onClick={onReset}
        >
          Start over
        </button>
      </div>
    </div>
  );
}
