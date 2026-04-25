import { DescartesQuestionsIds } from '@shared/src';

export const DescartesQuestionSubtitles: ReadonlyMap<
  DescartesQuestionsIds,
  string
> = new Map<DescartesQuestionsIds, string>()
  .set(
    DescartesQuestionsIds.Q1,
    $localize`:@@q1Subtitle:Upsides you gain when you commit to this decision.`,
  )
  .set(
    DescartesQuestionsIds.Q2,
    $localize`:@@q2Subtitle:Upsides you preserve by not acting on this decision.`,
  )
  .set(
    DescartesQuestionsIds.Q3,
    $localize`:@@q3Subtitle:Costs, losses, or trade-offs that come with acting.`,
  )
  .set(
    DescartesQuestionsIds.Q4,
    $localize`:@@q4Subtitle:What you give up or miss out on by not acting.`,
  );
