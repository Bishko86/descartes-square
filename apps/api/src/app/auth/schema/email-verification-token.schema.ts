import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailVerificationTokenDocument = EmailVerificationToken & Document;

@Schema({ collection: 'email_verification_tokens' })
export class EmailVerificationToken extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const EmailVerificationTokenSchema =
  SchemaFactory.createForClass(EmailVerificationToken);

// MongoDB auto-deletes documents 24h after expiresAt (48h from creation total).
// The grace period ensures consumeToken can still find expired-but-not-yet-deleted
// documents and return EXPIRED_TOKEN instead of INVALID_TOKEN.
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
