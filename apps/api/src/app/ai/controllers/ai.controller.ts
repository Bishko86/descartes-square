import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
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
    @Req() req: Request,
    @Body() payload: { variables: IAiSuggestionRequest },
  ): Promise<IAiSuggestionResponse> {
    const userId = req['user']['userId'];
    return this._descartesSquareService.generateDescartesSuggestions(
      payload.variables,
      userId,
    );
  }
}
