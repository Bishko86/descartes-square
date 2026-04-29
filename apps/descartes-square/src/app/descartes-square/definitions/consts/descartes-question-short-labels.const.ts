import { DescartesQuestionsIds } from '@shared/src';

export const DescartesQuestionShortLabels: ReadonlyMap<
  DescartesQuestionsIds,
  string
> = new Map<DescartesQuestionsIds, string>()
  .set(DescartesQuestionsIds.Q1, $localize`:@@q1ShortLabel:Pros of acting`)
  .set(DescartesQuestionsIds.Q2, $localize`:@@q2ShortLabel:Pros of not acting`)
  .set(DescartesQuestionsIds.Q3, $localize`:@@q3ShortLabel:Cons of acting`)
  .set(DescartesQuestionsIds.Q4, $localize`:@@q4ShortLabel:Cons of not acting`);
