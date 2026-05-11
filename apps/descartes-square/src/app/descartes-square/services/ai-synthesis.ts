import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import { environment } from '@environment/environment';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';
import { BalanceLean } from '@descartes/definitions/utils/balance.util';

export interface IAiSynthesisPayload {
  title: string;
  q1: string[];
  q2: string[];
  q3: string[];
  q4: string[];
}

export interface IAiSynthesisResponse {
  text: string;
}

const STUB_DELAY_MS = 600;

@Injectable({ providedIn: 'root' })
export class AiSynthesisService {
  readonly #httpClient = inject(HttpClient);
  readonly #baseUrl = environment.apiUrl;

  requestSynthesis(
    payload: IAiSynthesisPayload,
    lean: BalanceLean,
  ): Observable<IAiSynthesisResponse> {
    if (environment.aiSynthesisEnabled) {
      return this.#httpClient.post<IAiSynthesisResponse>(
        `${this.#baseUrl}/ai/synthesis`,
        { variables: payload, lean },
      );
    }
    return of({ text: this.#generateLocalSynthesis(payload, lean) }).pipe(
      delay(STUB_DELAY_MS),
    );
  }

  //@todo: remove this once the backend is ready
  #generateLocalSynthesis(
    payload: IAiSynthesisPayload,
    lean: BalanceLean,
  ): string {
    const counts: Record<TFormNames, number> = {
      q1: payload.q1.length,
      q2: payload.q2.length,
      q3: payload.q3.length,
      q4: payload.q4.length,
    };
    const topQ = (['q1', 'q2', 'q3', 'q4'] as TFormNames[]).reduce(
      (best, id) => (counts[id] > counts[best] ? id : best),
      'q1' as TFormNames,
    );
    const topLabel: Record<TFormNames, string> = {
      q1: $localize`:@@synthesisTopQ1:benefits of acting`,
      q2: $localize`:@@synthesisTopQ2:comforts of staying put`,
      q3: $localize`:@@synthesisTopQ3:real costs of acting`,
      q4: $localize`:@@synthesisTopQ4:missed opportunities of not acting`,
    };
    const topArgs = payload[topQ].slice(0, 2).join('; ');

    const leanText =
      lean === 'act'
        ? $localize`:@@synthesisLeanAct:The case for acting is heavier`
        : lean === 'stay'
          ? $localize`:@@synthesisLeanStay:The case for staying is heavier`
          : $localize`:@@synthesisLeanEven:Both sides are close in weight`;

    const detail = topArgs
      ? $localize`:@@synthesisDetailWith:You've invested most detail in the ${topLabel[topQ]}:topLabel: — notably: "${topArgs}:topArgs:".`
      : $localize`:@@synthesisDetailWithout:You've invested most detail in the ${topLabel[topQ]}:topLabel:.`;

    const tail = $localize`:@@synthesisTail:If that detail feels right, it's a signal. If you haven't filled the opposite quadrant in equal depth, do that before deciding.`;

    return `${leanText}. ${detail} ${tail}`;
  }
}
