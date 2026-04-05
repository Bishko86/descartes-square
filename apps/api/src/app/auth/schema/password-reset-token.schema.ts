import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordResetTokenDocument = PasswordResetToken & Document;

@Schema({ collection: 'password_reset_tokens' })
export class PasswordResetToken extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);

// MongoDB auto-deletes documents 1h after expiresAt (2h from creation total).
// The grace period ensures consumeToken can still find expired-but-not-yet-deleted
// documents and return EXPIRED_TOKEN instead of INVALID_TOKEN.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
