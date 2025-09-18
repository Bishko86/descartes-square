import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  readonly #genAI: GoogleGenerativeAI;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.get<string>('GOOGLE_API_KEY');
    this.#genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateSuggestions(prompt: string): Promise<string> {
    try {
      const model = this.#genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const result = await model.generateContent(prompt);

      return result.response.text();
    } catch (error) {
      console.error('Error generating suggestions:', error);

      // Handle specific Google AI API errors
      if (error.status === 503) {
        throw new HttpException(
          'AI service is currently overloaded. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (error.status === 429) {
        throw new HttpException(
          'Rate limit exceeded. Please wait before making another request.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error.status === 400) {
        throw new HttpException(
          'Invalid request to AI service.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generic error fallback
      throw new HttpException(
        'AI service is temporarily unavailable. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
