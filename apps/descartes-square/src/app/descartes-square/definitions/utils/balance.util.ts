import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';

export type BalanceLean = 'act' | 'stay' | 'even' | null;

export const DEFAULT_CONFIDENCE = 50;

export const ACT_THRESHOLD = 58;
export const STAY_THRESHOLD = 42;

export type QuadrantCounts = Record<TFormNames, number>;

export function classifyLean(counts: QuadrantCounts): BalanceLean {
  const act = counts.q1 + counts.q4;
  const stay = counts.q2 + counts.q3;
  const total = act + stay;
  if (total === 0) return null;
  const pct = Math.round((act / total) * 100);
  if (pct > ACT_THRESHOLD) return 'act';
  if (pct < STAY_THRESHOLD) return 'stay';
  return 'even';
}

export function confidenceLabel(value: number): string {
  if (value < 20) return $localize`:@@confidenceUnsure:Very unsure`;
  if (value < 40) return $localize`:@@confidenceLeaning:Leaning`;
  if (value < 60) return $localize`:@@confidenceFence:On the fence`;
  if (value < 80) return $localize`:@@confidenceFairly:Fairly sure`;
  return $localize`:@@confidenceConfident:Confident`;
}
