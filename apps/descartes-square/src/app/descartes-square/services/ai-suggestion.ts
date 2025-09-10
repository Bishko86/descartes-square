import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDescartesFormValues } from '@descartes/definitions/interfaces/descartes-form.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { IAiSuggestionResponse } from '@shared/src';

@Injectable()
export class AiSuggestionService {
  #baseUrl = environment.apiUrl;

  #httpClient = inject(HttpClient);

  addAISuggestion(
    payload: IDescartesFormValues,
  ): Observable<IAiSuggestionResponse> {
    return this.#httpClient.post<IAiSuggestionResponse>(
      `${this.#baseUrl}/ai/suggestions`,
      {
        variables: payload,
      },
    );
  }
}
