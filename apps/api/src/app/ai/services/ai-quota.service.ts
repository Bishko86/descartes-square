import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiQuota, AiQuotaDocument } from '@ai/schema/ai-quota.schema';
import {
  AI_QUOTA_MAX_PER_WINDOW,
  AI_QUOTA_WINDOW_MS,
} from '@shared/src/lib/consts/ai-suggestion-limits.const';

const DUPLICATE_KEY_ERROR = 11000;

@Injectable()
export class AiQuotaService {
  constructor(
    @InjectModel(AiQuota.name)
    private readonly _quotaModel: Model<AiQuotaDocument>,
  ) {}

  async consume(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    // Happy path — active window, under cap. One Mongo roundtrip.
    if (await this.#tryIncrement(userObjectId, now)) return;

    // Window expired OR doc doesn't exist yet — upsert a fresh window.
    // A concurrent request may have just done the same; in that case the
    // upsert hits the unique-userId constraint (E11000) and we retry below.
    try {
      const reset = await this._quotaModel.findOneAndUpdate(
        { userId: userObjectId, expiresAt: { $lte: now } },
        {
          $set: {
            count: 1,
            expiresAt: new Date(now.getTime() + AI_QUOTA_WINDOW_MS),
          },
        },
        { new: true, upsert: true },
      );
      if (reset) return;
    } catch (err) {
      if (err.code !== DUPLICATE_KEY_ERROR) throw err;
    }

    // Retry increment — covers the race where another request just
    // created/reset the doc. If we still can't increment, the cap is hit.
    if (await this.#tryIncrement(userObjectId, now)) return;

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'AI_QUOTA_EXHAUSTED',
        message: 'AI quota exhausted',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  #tryIncrement(
    userObjectId: Types.ObjectId,
    now: Date,
  ): Promise<AiQuotaDocument | null> {
    return this._quotaModel.findOneAndUpdate(
      {
        userId: userObjectId,
        expiresAt: { $gt: now },
        count: { $lt: AI_QUOTA_MAX_PER_WINDOW },
      },
      { $inc: { count: 1 } },
      { new: true },
    );
  }
}
