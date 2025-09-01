import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { AiController } from '@ai/controllers/ai.controller';
import { AiService } from '@ai/services/ai.service';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
