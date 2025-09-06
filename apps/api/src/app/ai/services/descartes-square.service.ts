import { Injectable } from '@nestjs/common';
import {
  DescartesQuestionsMap,
  IAiSuggestionRequest,
  IAiSuggestionResponse,
} from '@shared/src';
import { AiService } from '@ai/services/ai.service';

@Injectable()
export class DescartesSquareService {
  constructor(private readonly _aiSuggestionsService: AiService) {}

  async generateDescartesSuggestions(
    payload: IAiSuggestionRequest,
  ): Promise<IAiSuggestionResponse> {
    const prompt = this.#getPrompt(payload);
    const response =
      await this._aiSuggestionsService.generateSuggestions(prompt);
    const cleanedResponse = response
      .replace(/```json/g, '')
      .replace(/```/g, '');

    return JSON.parse(cleanedResponse.trim()) as IAiSuggestionResponse;
  }

  #getPrompt(req: IAiSuggestionRequest): string {
    return `
      You are an assistant helping users make better decisions using the Descartes Square method.

      The user is analyzing a decision with the following context:

      Decision title: "${req.title}"

      Answers so far:
      - What will happen if it happens? (Q1): ${req.q1.join('; ')}
      - What will happen if it doesn't happen? (Q2): ${req.q2.join('; ')}
      - What won't happen if it happens? (Q3): ${req.q3.join('; ')}
      - What won't happen if it doesn't happen? (Q4): ${req.q4.join('; ')}

      User's conclusion so far: ${req.conclusion || '(not provided)'}

      Your task:
      1. Focus only on the question: "${DescartesQuestionsMap.get(req.key)}".
      2. Provide exactly ONE helpful, hypothetical consequence or perspective that is not already mentioned above.
      3. Where possible, phrase it as something practical that the user could gain or lose from making or not making a decision.
      4. Keep it concise: 1–2 sentences, maximum 255 symbols.
      5. Be neutral and supportive — do not make the decision for the user.
      6. Do not repeat or rephrase what the user has already written in Q1–Q4.
      7. If the decision title is unclear, vague, or meaningless (e.g., "test", "not sure", "???"), return no suggestion. Instead, set the \`unclearTitle\` field with the message:
         "Your decision title is unclear. Please restate it as a specific decision, e.g., 'Should I move to another city?' or 'Should I start my own business?'"

      Output format:
      Return the result strictly in valid JSON following this TypeScript interface:

      export interface IAiSuggestionResponse {
        suggestion: string | null;
        unclearTitle: string | null;
      }

      If the title is valid, fill only \`suggestion\`.
      If the title is unclear, set \`suggestion: null\` and fill \`unclearTitle\`.
      Do not include any other fields.

      Now, generate the response for ${req.key}.
    `;
  }
}
