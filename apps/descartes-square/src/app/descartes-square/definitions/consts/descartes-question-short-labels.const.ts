import { DescartesQuestionsIds } from '@shared/src';

export const DescartesQuestionShortLabels: ReadonlyMap<
  DescartesQuestionsIds,
  string
> = new Map<DescartesQuestionsIds, string>()
  .set(DescartesQuestionsIds.Q1, $localize`:@@q1ShortLabel:Pros of acting`)
  .set(DescartesQuestionsIds.Q2, $localize`:@@q2ShortLabel:Pros of staying`)
  .set(DescartesQuestionsIds.Q3, $localize`:@@q3ShortLabel:Cost of acting`)
  .set(DescartesQuestionsIds.Q4, $localize`:@@q4ShortLabel:Cost of staying`);
