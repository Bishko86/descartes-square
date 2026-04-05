import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ select: false })
  refreshToken: string;

  @Prop({
    type: [{ provider: String, providerId: String, connectedAt: Date }],
    default: [],
  })
  providers: { provider: string; providerId: string; connectedAt: Date }[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: null })
  verifiedAt: Date | null;

  @Prop({ default: 'en', enum: ['en', 'uk'] })
  locale: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Auto-delete unverified users 24 hours after creation
UserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400,
    partialFilterExpression: { isVerified: false },
  },
);
