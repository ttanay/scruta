import { useMemo, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CsvInput } from './components/CsvInput';
import { GraphView } from './components/GraphView';
import { NodeTable } from './components/NodeTable';
import { DetailPanel } from './components/DetailPanel';
import { Legend } from './components/Legend';
import { Controls } from './components/Controls';
import { Footer } from './components/Footer';
import { parseProfileCsv } from './lib/csv/parseProfileCsv';
import { buildGraph } from './lib/graph/buildGraph';
import { aggregateByStep } from './lib/graph/aggregateByStep';
import { classify, DEFAULT_THRESHOLDS, type ClassifyThresholds } from './lib/bottleneck/classify';
import type { MetricKey, ProfileRow, ViewMode } from './lib/types';

function App() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>('aggregated');
  const [metric, setMetric] = useState<MetricKey>('elapsedUs');
  const [thresholds, setThresholds] = useState<ClassifyThresholds>(DEFAULT_THRESHOLDS);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function handleSubmit(csvText: string) {
    const result = parseProfileCsv(csvText);

    if (result.queryIds.length > 1) {
      setErrors([
        `Found ${result.queryIds.length} distinct query_ids in this CSV: ${result.queryIds.join(
          ', ',
        )}. Re-run your query filtered to a single query_id.`,
      ]);
      setWarnings([]);
      setRows([]);
      return;
    }

    setErrors(result.errors);
    setWarnings(result.warnings);
    setRows(result.errors.length === 0 ? result.rows : []);
    setSelectedKey(null);
  }

  function handleReset() {
    setRows([]);
    setErrors([]);
    setWarnings([]);
    setSelectedKey(null);
  }

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    setSelectedKey(null);
  }

  const graph = useMemo(() => {
    if (rows.length === 0) return null;
    const raw = buildGraph(rows);
    const view = viewMode === 'aggregated' ? aggregateByStep(raw) : raw;
    const nodes = classify(view.nodes, metric, thresholds);
    return { ...view, nodes };
  }, [rows, viewMode, metric, thresholds]);

  const selectedNode = useMemo(
    () => graph?.nodes.find((n) => n.key === selectedKey) ?? null,
    [graph, selectedKey],
  );

  if (!graph) {
    return (
      <div className="flex h-full flex-col">
        <div className="mx-auto w-full max-w-2xl flex-1 overflow-auto">
          <CsvInput onSubmit={handleSubmit} errors={errors} warnings={warnings} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Controls
        metric={metric}
        onMetricChange={setMetric}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        thresholds={thresholds}
        onThresholdsChange={setThresholds}
        onReset={handleReset}
      />

      {(errors.length > 0 || warnings.length > 0) && (
        <div className="flex flex-col gap-1 border-b border-gray-200 p-2 text-xs dark:border-gray-700">
          {errors.map((e) => (
            <div key={e} className="text-red-600 dark:text-red-400">
              {e}
            </div>
          ))}
          {warnings.map((w) => (
            <div key={w} className="text-amber-600 dark:text-amber-400">
              {w}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlowProvider>
            <GraphView
              nodes={graph.nodes}
              edges={graph.edges}
              selectedKey={selectedKey}
              onSelectNode={setSelectedKey}
              metric={metric}
            />
          </ReactFlowProvider>
        </div>

        <button
          type="button"
          onClick={() => setSidebarCollapsed((c) => !c)}
          title={sidebarCollapsed ? 'Expand panel' : 'Collapse panel'}
          className="flex w-5 shrink-0 items-center justify-center border-l border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          {sidebarCollapsed ? '‹' : '›'}
        </button>

        {!sidebarCollapsed && (
          <div className="flex w-[340px] shrink-0 flex-col border-l border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 p-2 dark:border-gray-700">
              <Legend thresholds={thresholds} />
            </div>
            <div className="h-1/2 overflow-hidden border-b border-gray-200 dark:border-gray-700">
              <NodeTable
                nodes={graph.nodes}
                metric={metric}
                selectedKey={selectedKey}
                onSelectNode={setSelectedKey}
              />
            </div>
            <div className="h-1/2 overflow-hidden">
              <DetailPanel node={selectedNode} onClose={() => setSelectedKey(null)} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;
