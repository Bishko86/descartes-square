import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import {
  EmailVerificationToken,
  EmailVerificationTokenDocument,
} from '@auth/schema/email-verification-token.schema';

@Injectable()
export class EmailVerificationTokenService {
  constructor(
    @InjectModel(EmailVerificationToken.name)
    private readonly tokenModel: Model<EmailVerificationTokenDocument>,
  ) {}

  async createToken(userId: Types.ObjectId, email: string): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(raw).digest('hex');

    await this.tokenModel.deleteMany({ userId });

    await this.tokenModel.create({
      userId,
      token: hash,
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return raw;
  }

  async deleteTokensForUser(userId: Types.ObjectId): Promise<void> {
    await this.tokenModel.deleteMany({ userId });
  }

  async consumeToken(
    raw: string,
  ): Promise<EmailVerificationTokenDocument> {
    const hash = createHash('sha256').update(raw).digest('hex');

    const record = await this.tokenModel.findOneAndDelete({ token: hash });

    if (!record) {
      throw new Error('INVALID_TOKEN');
    }
    if (record.expiresAt < new Date()) {
      throw new Error('EXPIRED_TOKEN');
    }

    return record;
  }
}
