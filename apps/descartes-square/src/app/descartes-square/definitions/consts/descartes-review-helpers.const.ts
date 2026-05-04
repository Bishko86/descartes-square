import { DescartesQuestionsIds } from '@shared/src';

export const DescartesReviewHelpers: ReadonlyMap<
  DescartesQuestionsIds,
  string
> = new Map<DescartesQuestionsIds, string>()
  .set(
    DescartesQuestionsIds.Q1,
    $localize`:@@q1ReviewHelper:What will happen if you do it?`,
  )
  .set(
    DescartesQuestionsIds.Q2,
    $localize`:@@q2ReviewHelper:What will happen if you don't?`,
  )
  .set(
    DescartesQuestionsIds.Q3,
    $localize`:@@q3ReviewHelper:What won't happen if you do it?`,
  )
  .set(
    DescartesQuestionsIds.Q4,
    $localize`:@@q4ReviewHelper:What won't happen if you don't?`,
  );
