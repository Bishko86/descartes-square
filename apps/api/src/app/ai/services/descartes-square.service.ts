import { BadRequestException, Injectable } from '@nestjs/common';
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
    const responseJson =
      await this._aiSuggestionsService.generateSuggestions(prompt);
    const cleanedResponse = responseJson
      .replace(/```json/g, '')
      .replace(/```/g, '');

    try {
      return JSON.parse(cleanedResponse.trim()) as IAiSuggestionResponse;
    } catch (error) {
      throw new BadRequestException(error.message || 'Invalid response');
    }
  }

  #getPrompt(req: IAiSuggestionRequest): string {
    return `
      You are a function that returns ONLY raw JSON. Do not include code fences or any text outside JSON.

      Context for a Descartes Square decision:
      - Decision title: "${req.title}"
      - Q1 (What will happen if it happens?): ${req.q1.join('; ')}
      - Q2 (What will happen if it doesn't happen?): ${req.q2.join('; ')}
      - Q3 (What won't happen if it happens?): ${req.q3.join('; ')}
      - Q4 (What won't happen if it doesn't happen?): ${req.q4.join('; ')}
      - User conclusion: ${req.conclusion || '(not provided)'}

      Target question to answer: "${DescartesQuestionsMap.get(req.key)}"

      Your job:
      1) If the decision title is UNCLEAR, return no suggestion and ask the user to clarify the title.
         Treat the title as UNCLEAR if ANY of the following are true:
         Very short (< 8 characters after trimming) OR mostly punctuation/digits.
         Placeholder/generic (e.g., "test", "title", "todo", "not sure", "idk", "help", "???", "random", "asdf", "12345").
         Any nonsensical or meaningless string (e.g., random letters like "testc", "qwerty", "loremipsum").
         Lacks a concrete decision/action (no clear action like change/move/accept/buy/start/quit/invest/learn/hire; or it’s just a single generic noun like "job", "life", "decision").
         Ambiguous scope with no object (e.g., "change", "improve", "do it", "move" without a destination/target).
         When in doubt, ALWAYS treat as UNCLEAR.
         IMPORTANT: If the title is UNCLEAR, you MUST ignore Q1–Q4 completely and return null suggestion.

      2) If the title is CLEAR, produce exactly ONE new, helpful suggestion for the target question:
         - Focus on Decision title: "${req.title}" and target question ${req.key}.
         - Must be NEW (do not repeat or rephrase anything already in Q1–Q4).
         - Make it practical: what user can gain or lose from making or not making a decision.
         - Neutral, supportive tone; do not tell the user what to do.
         - Length: 1–2 sentences, max 255 characters.

      Output format (strict):
      Return ONLY valid JSON matching this interface:
      {
        "suggestion": string | null,
        "isUnclearTitle": boolean
      }

      Rules:
      - If title is CLEAR: set "suggestion" with your single suggestion; set "isUnclearTitle": false.
      - If title is UNCLEAR: set "suggestion": null; set "isUnclearTitle": true
      - Do not include any extra fields, explanations, or markdown. No code fences.

      Examples to follow exactly:

      Unclear title example:
      INPUT title: "test"
      OUTPUT:
      {"suggestion": null, "isUnclearTitle": true"}

      Clear title example:
      INPUT title: "Should I change my job?"
      OUTPUT:
      {"suggestion": "Estimate total compensation and growth over 2–3 years (salary, bonus, equity, learning) and compare against staying put with realistic promotion timelines.", "isUnclearTitle": false}

      Now produce the JSON response for the target question key ${req.key}.
    `;
  }
}
