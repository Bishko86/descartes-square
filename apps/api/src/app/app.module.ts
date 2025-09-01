import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '@ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_CONNECTION),
    AuthModule,
    AiModule,
  ],
})
export class AppModule {}
