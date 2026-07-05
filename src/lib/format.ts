import type { MetricKey } from './types';

export function formatDuration(us: number): string {
  if (!Number.isFinite(us)) return '—';
  if (us < 1000) return `${Math.round(us)}µs`;
  const ms = us / 1000;
  if (ms < 1000) return `${ms.toFixed(ms < 10 ? 2 : 0)}ms`;
  const s = ms / 1000;
  return `${s.toFixed(s < 10 ? 2 : 1)}s`;
}

export function formatCount(n: bigint | number): string {
  const value = typeof n === 'bigint' ? n : BigInt(Math.round(n));
  const abs = value < 0n ? -value : value;
  const sign = value < 0n ? '-' : '';
  if (abs < 1000n) return `${sign}${abs}`;
  const units: [bigint, string][] = [
    [1_000_000_000_000n, 'T'],
    [1_000_000_000n, 'B'],
    [1_000_000n, 'M'],
    [1_000n, 'K'],
  ];
  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = Number(abs) / Number(threshold);
      return `${sign}${scaled.toFixed(scaled < 10 ? 2 : 1)}${suffix}`;
    }
  }
  return `${sign}${abs}`;
}

export function formatBytes(n: bigint | number): string {
  const value = typeof n === 'bigint' ? n : BigInt(Math.round(n));
  const abs = value < 0n ? -value : value;
  const sign = value < 0n ? '-' : '';
  if (abs < 1024n) return `${sign}${abs}B`;
  const units: [bigint, string][] = [
    [1024n ** 4n, 'TiB'],
    [1024n ** 3n, 'GiB'],
    [1024n ** 2n, 'MiB'],
    [1024n, 'KiB'],
  ];
  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = Number(abs) / Number(threshold);
      return `${sign}${scaled.toFixed(scaled < 10 ? 2 : 1)}${suffix}`;
    }
  }
  return `${sign}${abs}B`;
}

export function formatPercent(share: number): string {
  return `${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%`;
}

export function formatMetricValue(value: number, metric: MetricKey): string {
  switch (metric) {
    case 'elapsedUs':
    case 'inputWaitElapsedUs':
    case 'outputWaitElapsedUs':
      return formatDuration(value);
    case 'outputRows':
      return formatCount(value);
    case 'outputBytes':
      return formatBytes(value);
  }
}
