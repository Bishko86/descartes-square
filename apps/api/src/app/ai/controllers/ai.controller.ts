import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import {
  CurrentUser,
  ICurrentUser,
} from '@auth/decorators/current-user.decorator';
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
    @CurrentUser() user: ICurrentUser,
    @Body() payload: { variables: IAiSuggestionRequest },
  ): Promise<IAiSuggestionResponse> {
    return this._descartesSquareService.generateDescartesSuggestions(
      payload.variables,
      user.userId,
    );
  }
}
