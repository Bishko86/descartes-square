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
}

export const UserSchema = SchemaFactory.createForClass(User);
