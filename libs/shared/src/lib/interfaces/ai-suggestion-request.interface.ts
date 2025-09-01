import { DescartesQuestionsIds } from '../enums/descartes-questions-ids.enum';

export interface IAiSuggestionRequest {
  title: string;
  key: DescartesQuestionsIds;
  q1: string[];
  q2: string[];
  q3: string[];
  q4: string[];
  conclusion: string;
}

export interface IAiSuggestionResponse {
  suggestion: string;
}
