import { DescartesQuestionsIds } from '../enums/descartes-questions-ids.enum';

export const DescartesQuestionsMap = new Map<DescartesQuestionsIds, string>()
  .set(DescartesQuestionsIds.Q1, $localize`:@@question1:What will happen if it happens?`)
  .set(DescartesQuestionsIds.Q2, $localize`:@@question2:What will happen if it doesn't happen?`)
  .set(DescartesQuestionsIds.Q3, $localize`:@@question3:What won't happen if it happens?`)
  .set(DescartesQuestionsIds.Q4, $localize`:@@question4:What won't happen if it doesn't happen?`);
