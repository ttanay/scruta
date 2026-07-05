import type { ClassifyThresholds } from '../lib/bottleneck/classify';
import { formatPercent } from '../lib/format';

interface LegendProps {
  thresholds: ClassifyThresholds;
}

export function Legend({ thresholds }: LegendProps) {
  return (
    <div className="flex flex-col gap-1 rounded border border-gray-200 p-2 text-xs dark:border-gray-700">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border-2 border-red-500 bg-red-100 dark:bg-red-950/50" />
        <span>Bottleneck — ≥{formatPercent(thresholds.redShare)} of total, or the single largest</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border-2 border-amber-500 bg-amber-100 dark:bg-amber-950/40" />
        <span>Notable — ≥{formatPercent(thresholds.yellowShare)} of total</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" />
        <span>Minor contributor</span>
      </div>
      <p className="mt-1 text-gray-500">
        Share is relative to the sum across visible nodes — processors run concurrently across
        threads, so this is not a wall-clock percentage.
      </p>
    </div>
  );
}
