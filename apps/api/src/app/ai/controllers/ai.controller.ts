import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { IAiSuggestionRequest, IAiSuggestionResponse } from '@shared/src';
import { DescartesSquareService } from '@ai/services/descartes-square.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly _descartesSquareService: DescartesSquareService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post('suggestions')
  generateSuggestions(
    @Body() payload: { variables: IAiSuggestionRequest },
  ): Promise<IAiSuggestionResponse> {
    return this._descartesSquareService.generateDescartesSuggestions(
      payload.variables,
    );
  }
}
