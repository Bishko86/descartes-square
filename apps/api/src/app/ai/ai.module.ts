import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@auth/auth.module';
import { AiController } from '@ai/controllers/ai.controller';
import { AiService } from '@ai/services/ai.service';
import { AiQuotaService } from '@ai/services/ai-quota.service';
import { AiQuota, AiQuotaSchema } from '@ai/schema/ai-quota.schema';
import { DescartesSquareService } from './services/descartes-square.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: AiQuota.name, schema: AiQuotaSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, DescartesSquareService, AiQuotaService],
})
export class AiModule {}
