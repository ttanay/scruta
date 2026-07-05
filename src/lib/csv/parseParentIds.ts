// Parses ClickHouse's CSV array syntax for a single cell value, e.g.
// "[1,2,3]" or "[]" (possibly with whitespace). See specification.md §3.3.
export function parseParentIds(raw: string): string[] {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '[]') return [];

  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    throw new Error(`expected array syntax like "[1,2]", got "${raw}"`);
  }

  const inner = trimmed.slice(1, -1).trim();
  if (inner === '') return [];

  return inner
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
