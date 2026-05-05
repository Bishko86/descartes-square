import { DescartesQuestionsIds } from '@shared/src';

import {
  IAccentBarSegment,
  ACCENT_BAR_EMPTY,
} from '@descartes/definitions/consts/accent-bar.const';
import { QuadrantCounts } from '@descartes/definitions/utils/balance.util';

export function buildAccentBar(
  counts: QuadrantCounts,
  total: number,
): IAccentBarSegment[] {
  if (total === 0) return ACCENT_BAR_EMPTY;
  return [
    { quadrant: DescartesQuestionsIds.Q1, pct: (counts.q1 / total) * 100 },
    { quadrant: DescartesQuestionsIds.Q4, pct: (counts.q4 / total) * 100 },
    { quadrant: DescartesQuestionsIds.Q3, pct: (counts.q3 / total) * 100 },
    { quadrant: DescartesQuestionsIds.Q2, pct: (counts.q2 / total) * 100 },
  ];
}
