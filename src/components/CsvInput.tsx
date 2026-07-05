import { useState } from 'react';

const EXAMPLE_QUERY = `SELECT *
FROM system.processors_profile_log
WHERE query_id = '<id>'
FORMAT CSVWithNames`;

interface CsvInputProps {
  onSubmit: (csvText: string) => void;
  errors: string[];
  warnings: string[];
}

export function CsvInput({ onSubmit, errors, warnings }: CsvInputProps) {
  const [text, setText] = useState('');

  return (
    <div className="flex flex-col gap-3 p-4">
      <div>
        <h1 className="text-lg font-semibold">scruta</h1>
        <p className="text-sm text-gray-500">
          Paste the CSV output of a <code className="font-mono">system.processors_profile_log</code>{' '}
          query for a single <code className="font-mono">query_id</code>. Nothing is uploaded — all
          parsing happens in your browser.
        </p>
        <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
          <code>{EXAMPLE_QUERY}</code>
        </pre>
      </div>

      <textarea
        className="h-40 w-full resize-y rounded border border-gray-300 p-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900"
        placeholder="id,parent_ids,name,plan_step,plan_group,query_id,elapsed_us,..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={text.trim() === ''}
          onClick={() => onSubmit(text)}
        >
          Visualize
        </button>
      </div>

      {errors.length > 0 && (
        <div className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {errors.map((err) => (
            <div key={err}>{err}</div>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {warnings.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
      )}
    </div>
  );
}
