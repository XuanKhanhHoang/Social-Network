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

  async findOneByToken(token: string): Promise<{
    userId: string;
    email: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
    type: string;
    _id: string;
  } | null> {
    return this.emailVerificationModel
      .findOne({
        token,
        expiresAt: { $gt: new Date() },
        isUsed: false,
      })
      .populate('userId')
      .lean()
      .exec() as unknown as any;
  }

  async deleteManyRegistrationTokens(email: string) {
    return this.emailVerificationModel
      .deleteMany({
        email,
        type: 'registration',
      })
      .exec();
  }

  async markAsUsed(verificationId: string): Promise<EmailVerificationDocument> {
    return this.emailVerificationModel.findByIdAndUpdate(
      verificationId,
      { isUsed: true },
      { new: true },
    );
  }
}
