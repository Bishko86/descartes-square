import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { AiController } from '@ai/controllers/ai.controller';
import { AiService } from '@ai/services/ai.service';
import { DescartesSquareService } from './services/descartes-square.service';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [AiService, DescartesSquareService],
})
export class AiModule {}
