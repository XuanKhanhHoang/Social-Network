import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmailVerificationDocument } from 'src/schemas';
type CreateVerificationData = {
  userId: string | Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  type: 'registration' | 'password_reset';
};

@Injectable()
export class EmailVerificationRepository {
  constructor(
    @InjectModel(EmailVerificationDocument.name)
    private emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async create(
    input: CreateVerificationData,
  ): Promise<EmailVerificationDocument> {
    const newVerification = new this.emailVerificationModel(input);
    return newVerification.save();
  }

  async findOneByToken(
    token: string,
  ): Promise<EmailVerificationDocument | null> {
    return this.emailVerificationModel
      .findOne({
        token,
        expiresAt: { $gt: new Date() },
        isUsed: false,
      })
      .populate('userId')
      .lean()
      .exec();
  }

  async deleteManyRegistrationTokens(email: string) {
    return this.emailVerificationModel
      .deleteMany({
        email,
        type: 'registration',
      })
      .exec();
  }

  async markAsUsed(
    verification: EmailVerificationDocument,
  ): Promise<EmailVerificationDocument> {
    verification.isUsed = true;
    return verification.save();
  }
}
