import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from '../services/ai.service';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { IAiSuggestionRequest, IAiSuggestionResponse } from '@shared/src';

@Controller('ai')
export class AiController {
  constructor(private readonly aiSuggestionsService: AiService) {}

  @UseGuards(AccessTokenGuard)
  @Post('suggestions')
  generateSuggestions(
    @Body() payload: IAiSuggestionRequest,
  ): Promise<IAiSuggestionResponse> {
    return this.aiSuggestionsService.generateSuggestions(payload);
  }
}
