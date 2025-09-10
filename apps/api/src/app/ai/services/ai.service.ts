import { Injectable } from '@nestjs/common';
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

      throw new Error('Failed to generate AI suggestion.');
    }
  }
}
