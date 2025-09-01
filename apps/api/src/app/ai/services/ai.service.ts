import { Injectable } from '@nestjs/common';
import { IAiSuggestionRequest, IAiSuggestionResponse } from '@shared/src';

@Injectable()
export class AiService {
  async generateSuggestions(
    payload: IAiSuggestionRequest,
  ): Promise<IAiSuggestionResponse> {
    //@todo add implementation
    console.log(payload);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ suggestion: 'text ai suggestion message' });
      }, 1000);
    });
  }
}
