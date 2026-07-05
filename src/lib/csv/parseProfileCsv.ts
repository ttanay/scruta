import Papa from 'papaparse';
import { parseParentIds } from './parseParentIds';
import type { ProfileRow } from '../types';

const REQUIRED_COLUMNS = ['id', 'parent_ids', 'name'];

export interface ParseResult {
  rows: ProfileRow[];
  errors: string[];
  warnings: string[];
  queryIds: string[];
}

function toNullableNumber(v: string | undefined): number | null {
  if (v === undefined || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toNullableBigInt(v: string | undefined): bigint | null {
  if (v === undefined || v.trim() === '') return null;
  try {
    return BigInt(v.trim());
  } catch {
    return null;
  }
}

export function parseProfileCsv(csvText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const trimmedInput = csvText.trim();
  if (trimmedInput === '') {
    return { rows: [], errors: [], warnings: [], queryIds: [] };
  }

  const parsed = Papa.parse<Record<string, string>>(trimmedInput, {
    header: true,
    skipEmptyLines: true,
  });

  for (const e of parsed.errors) {
    errors.push(`CSV parse error: ${e.message} (row ${e.row ?? '?'})`);
  }

  const fields = parsed.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((c) => !fields.includes(c));
  if (missing.length > 0) {
    errors.push(
      `Missing required column(s): ${missing.join(', ')}. Found columns: ${
        fields.join(', ') || '(none)'
      }. Make sure the query used FORMAT CSVWithNames (not plain CSV).`,
    );
    return { rows: [], errors, warnings, queryIds: [] };
  }

  const rows: ProfileRow[] = [];
  const queryIdSet = new Set<string>();

  parsed.data.forEach((record, idx) => {
    const rowNum = idx + 2; // account for the header row
    const id = record.id?.trim();
    if (!id) {
      warnings.push(`Row ${rowNum}: missing "id", row skipped.`);
      return;
    }

    let parentIds: string[] = [];
    try {
      parentIds = parseParentIds(record.parent_ids ?? '[]');
    } catch (e) {
      warnings.push(
        `Row ${rowNum}: could not parse parent_ids "${record.parent_ids}" (${
          (e as Error).message
        }), treating as no parents.`,
      );
    }

    const queryId = record.query_id?.trim() || null;
    if (queryId) queryIdSet.add(queryId);

    rows.push({
      id,
      parentIds,
      name: record.name?.trim() || '(unnamed)',
      planStep: record.plan_step?.trim() || null,
      planGroup: record.plan_group?.trim() || null,
      queryId,
      elapsedUs: toNullableNumber(record.elapsed_us) ?? 0,
      inputWaitElapsedUs: toNullableNumber(record.input_wait_elapsed_us),
      outputWaitElapsedUs: toNullableNumber(record.output_wait_elapsed_us),
      inputRows: toNullableBigInt(record.input_rows),
      inputBytes: toNullableBigInt(record.input_bytes),
      outputRows: toNullableBigInt(record.output_rows),
      outputBytes: toNullableBigInt(record.output_bytes),
      eventTimeMicroseconds: record.event_time_microseconds?.trim() || null,
      hostName: record.host_name?.trim() || record.hostname?.trim() || null,
      raw: record,
    });
  });

  return { rows, errors, warnings, queryIds: Array.from(queryIdSet) };
}
