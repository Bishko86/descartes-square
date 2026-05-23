import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { IAiSuggestionRequest, IAiSuggestionResponse } from '@shared/src';

@Injectable()
export class AiSuggestionService {
  #baseUrl = environment.apiUrl;

  #httpClient = inject(HttpClient);

  addAISuggestion(
    payload: IAiSuggestionRequest,
  ): Observable<IAiSuggestionResponse> {
    return this.#httpClient.post<IAiSuggestionResponse>(
      `${this.#baseUrl}/ai/suggestions`,
      {
        variables: payload,
      },
    );
  }
}
