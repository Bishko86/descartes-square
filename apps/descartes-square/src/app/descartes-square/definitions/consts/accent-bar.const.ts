import { DescartesQuestionsIds } from '@shared/src';

export interface IAccentBarSegment {
  quadrant: DescartesQuestionsIds;
  pct: number;
}

export const ACCENT_BAR_EMPTY: IAccentBarSegment[] = [
  { quadrant: DescartesQuestionsIds.Q1, pct: 25 },
  { quadrant: DescartesQuestionsIds.Q4, pct: 25 },
  { quadrant: DescartesQuestionsIds.Q3, pct: 25 },
  { quadrant: DescartesQuestionsIds.Q2, pct: 25 },
];
