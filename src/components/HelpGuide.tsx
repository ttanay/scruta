import { useState, type ReactNode } from 'react';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{children}</p>
    </div>
  );
}

export function HelpGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Usage guide"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-base font-semibold">Using scruta</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto p-4 text-sm">
              <Section title="What this shows">
                Paste the CSV output of a <code>system.processors_profile_log</code> query for a
                single <code>query_id</code> and this renders the query's execution pipeline as a
                graph. Nothing is uploaded — parsing happens entirely in your browser.
              </Section>

              <Section title="Reading the graph">
                Each box is a processor — one step in the pipeline. Arrows show the direction data
                flows, from source processors toward the final output. Color ranks how much each
                processor contributes to the selected metric:{' '}
                <span className="font-medium text-red-600 dark:text-red-400">red</span> marks a
                bottleneck,{' '}
                <span className="font-medium text-amber-600 dark:text-amber-400">yellow</span> a
                notable contributor, and{' '}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">green</span>{' '}
                a minor one. The percentage on each card is its share of the total across all
                visible nodes — not a wall-clock percentage, since processors run concurrently
                across threads.
              </Section>

              <Section title="Metric">
                Switches what "cost" means for ranking and coloring: execution time (the
                default), time spent waiting on input or output, or output row/byte counts.
              </Section>

              <Section title="By step vs. per instance">
                <span className="font-medium">By step</span> (default) groups every parallel
                thread instance of the same pipeline step into one node, showing the total plus
                the max/avg spread across instances.{' '}
                <span className="font-medium">Per instance</span> shows every individual
                processor thread separately — use it to spot one thread doing far more work than
                its peers.
              </Section>

              <Section title="Red / yellow thresholds">
                Adjustable percentage cutoffs for the color ranking above. The single largest
                contributor is always shown red, even if it falls under the threshold, so there's
                always a clear answer to "what's the bottleneck".
              </Section>

              <Section title="Table and detail panel">
                Click any node — in the graph or in the table — to see its full stats and a short
                description of what that ClickHouse processor actually does. Click the table's
                "Value" column header to flip the sort order.
              </Section>

              <Section title="Collapsing the side panel">
                The ‹ / › strip on the right edge hides or shows the legend/table/detail panel, so
                the graph can use the full width when you don't need them.
              </Section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
