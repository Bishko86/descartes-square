import { DescartesQuestionsIds } from '@shared/src';

export const QUADRANT_ORDER: readonly DescartesQuestionsIds[] = [
  DescartesQuestionsIds.Q1,
  DescartesQuestionsIds.Q2,
  DescartesQuestionsIds.Q3,
  DescartesQuestionsIds.Q4,
] as const;

export const QUADRANT_NUMBER: ReadonlyMap<
  DescartesQuestionsIds,
  1 | 2 | 3 | 4
> = new Map<DescartesQuestionsIds, 1 | 2 | 3 | 4>()
  .set(DescartesQuestionsIds.Q1, 1)
  .set(DescartesQuestionsIds.Q2, 2)
  .set(DescartesQuestionsIds.Q3, 3)
  .set(DescartesQuestionsIds.Q4, 4);
