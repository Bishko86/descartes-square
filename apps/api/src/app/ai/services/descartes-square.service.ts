import { BadRequestException, Injectable } from '@nestjs/common';
import { IAiSuggestionRequest, IAiSuggestionResponse } from '@shared/src';
import {
  AI_EXISTING_ARG_LENGTH_MAX,
  AI_EXISTING_ARGS_MAX,
  AI_SUGGESTION_COUNT_DEFAULT,
  AI_SUGGESTION_COUNT_MAX,
  AI_SUGGESTION_COUNT_MIN,
} from '@shared/src/lib/consts/ai-suggestion-limits.const';
import { AiService } from '@ai/services/ai.service';
import { AiQuotaService } from '@ai/services/ai-quota.service';

interface IParsedResponse {
  isUnclearTitle: boolean;
  suggestions: unknown[];
}

@Injectable()
export class DescartesSquareService {
  constructor(
    private readonly _aiSuggestionsService: AiService,
    private readonly _aiQuotaService: AiQuotaService,
  ) {}

  async generateDescartesSuggestions(
    payload: IAiSuggestionRequest,
    userId: string,
  ): Promise<IAiSuggestionResponse> {
    // Consume quota first so abuse can't run up the Gemini bill.
    await this._aiQuotaService.consume(userId);

    const count = this.#clampCount(payload.count);
    const existing = this.#sanitizeStrings(payload.existing, {
      maxCount: AI_EXISTING_ARGS_MAX,
      maxLength: AI_EXISTING_ARG_LENGTH_MAX,
    });

    const raw = await this._aiSuggestionsService.generateSuggestions(
      buildSuggestionPrompt(payload, count, existing),
    );
    const parsed = this.#parseResponse(raw);

    if (parsed.isUnclearTitle) {
      return { suggestions: [], isUnclearTitle: true };
    }

    return {
      suggestions: this.#sanitizeStrings(parsed.suggestions, {
        maxCount: count,
        exclude: existing,
      }),
      isUnclearTitle: false,
    };
  }

  #clampCount(raw: number | undefined): number {
    const n =
      typeof raw === 'number' && Number.isFinite(raw)
        ? Math.floor(raw)
        : AI_SUGGESTION_COUNT_DEFAULT;
    return Math.min(
      AI_SUGGESTION_COUNT_MAX,
      Math.max(AI_SUGGESTION_COUNT_MIN, n),
    );
  }

  #sanitizeStrings(
    raw: readonly unknown[] | undefined,
    opts: { maxCount: number; maxLength?: number; exclude?: readonly string[] },
  ): string[] {
    if (!Array.isArray(raw)) return [];
    const blocked = new Set((opts.exclude ?? []).map((s) => s.toLowerCase()));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of raw) {
      if (typeof item !== 'string') continue;
      const trimmed = opts.maxLength
        ? item.trim().slice(0, opts.maxLength)
        : item.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (blocked.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push(trimmed);
      if (out.length >= opts.maxCount) break;
    }
    return out;
  }

  #parseResponse(raw: string): IParsedResponse {
    const cleaned = raw.replace(/```(?:json)?/g, '').trim();
    let parsed: { suggestions?: unknown; isUnclearTitle?: unknown };
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      throw new BadRequestException(error.message || 'Invalid AI response');
    }
    if (parsed.isUnclearTitle === true) {
      return { isUnclearTitle: true, suggestions: [] };
    }
    if (!Array.isArray(parsed.suggestions)) {
      throw new BadRequestException('Invalid AI response: suggestions missing');
    }
    return { isUnclearTitle: false, suggestions: parsed.suggestions };
  }
}

function buildSuggestionPrompt(
  req: IAiSuggestionRequest,
  count: number,
  existing: string[],
): string {
  const existingBlock = existing.length
    ? existing.map((s, i) => `${i + 1}. ${s}`).join('\n')
    : '(none)';

  return `
      You are a function that returns ONLY raw JSON. Do not include code fences or any text outside JSON.

      Context for a Descartes Square decision:
      - Decision title: "${req.title}"
      - Q1 (What will happen if it happens?): ${req.q1.join('; ')}
      - Q2 (What will happen if it doesn't happen?): ${req.q2.join('; ')}
      - Q3 (What won't happen if it happens?): ${req.q3.join('; ')}
      - Q4 (What won't happen if it doesn't happen?): ${req.q4.join('; ')}
      - User conclusion: ${req.conclusion || '(not provided)'}

      Target question to answer: "${req.key}"

      Already listed in this quadrant — do NOT repeat, rephrase, or paraphrase any of these:
      ${existingBlock}

      Your job:
      1) If the decision title is UNCLEAR, return an empty suggestions array and flag it.
         Treat the title as UNCLEAR if ANY of the following are true:
         Very short (< 8 characters after trimming) OR mostly punctuation/digits.
         Placeholder/generic (e.g., "test", "title", "todo", "not sure", "idk", "help", "???", "random", "asdf", "12345").
         Any nonsensical or meaningless string (e.g., random letters like "testc", "qwerty", "loremipsum").
         Lacks a concrete decision/action (no clear action like change/move/accept/buy/start/quit/invest/learn/hire; or it's just a single generic noun like "job", "life", "decision").
         Ambiguous scope with no object (e.g., "change", "improve", "do it", "move" without a destination/target).
         When in doubt, ALWAYS treat as UNCLEAR.
         IMPORTANT: If the title is UNCLEAR, you MUST ignore Q1–Q4 and the "Already listed" block completely and return suggestions: [].

      2) If the title is CLEAR, produce EXACTLY ${count} new, helpful suggestions for the target question:
         - Each must be NEW: do not repeat or rephrase anything in Q1–Q4 or in the "Already listed" block above.
         - The ${count} suggestions must be DISTINCT from each other — no near-duplicates or paraphrases.
         - Focus on Decision title: "${req.title}" and target question ${req.key}.
         - Make each practical: what the user can gain or lose from making or not making the decision.
         - Neutral, supportive tone; do not tell the user what to do.
         - Length: 1–2 sentences each, max 255 characters each.

      Output format (strict):
      Return ONLY valid JSON matching this interface:
      {
        "suggestions": string[],
        "isUnclearTitle": boolean
      }

      Rules:
      - If title is CLEAR: set "suggestions" to an array of exactly ${count} distinct strings; set "isUnclearTitle": false.
      - If title is UNCLEAR: set "suggestions": []; set "isUnclearTitle": true.
      - Do not include any extra fields, explanations, or markdown. No code fences.

      Examples to follow exactly:

      Unclear title example:
      INPUT title: "test"
      OUTPUT:
      {"suggestions": [], "isUnclearTitle": true}

      Clear title example (count = 3):
      INPUT title: "Should I change my job?"
      OUTPUT:
      {"suggestions": ["Estimate total compensation and growth over 2–3 years (salary, bonus, equity, learning) and compare against staying put with realistic promotion timelines.", "Map the day-to-day work you would actually do in the new role — meetings, ownership, tools — against what energises you today.", "Account for transition costs: notice period, onboarding ramp-up, lost vesting, and the social capital you have built with your current team."], "isUnclearTitle": false}

      Now produce the JSON response for the target question key ${req.key} with exactly ${count} suggestions.
    `;
}
