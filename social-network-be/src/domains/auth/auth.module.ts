import { Module } from '@nestjs/common';
import { EmailVerificationRepository } from './services/email-verification.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerificationDocument,
  EmailVerificationSchema,
} from 'src/schemas';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'EmailVerification', schema: EmailVerificationSchema },
    ]),
  ],
  providers: [AuthService, EmailVerificationRepository],
  exports: [AuthService, EmailVerificationRepository],
})
export class AuthModule {}
