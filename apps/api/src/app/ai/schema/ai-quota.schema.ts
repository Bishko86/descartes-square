import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiQuotaDocument = AiQuota & Document;

@Schema({ collection: 'ai_quotas' })
export class AiQuota {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  count: number;

  @Prop({ required: true })
  expiresAt: Date;
}

export const AiQuotaSchema = SchemaFactory.createForClass(AiQuota);

// Covers both the increment and reset queries, which filter on userId + expiresAt.
AiQuotaSchema.index({ userId: 1, expiresAt: 1 });

// TTL — MongoDB auto-deletes quota docs once the window has expired.
// Inactive users don't accumulate state.
AiQuotaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
