import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/services';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { EmailVerificationRepository } from 'src/domains/auth/services/email-verification.repository';
import { Gender } from 'src/share/enums';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
}
export interface RegisterOutput {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}
@Injectable()
export class RegisterService extends BaseUseCaseService<
  RegisterInput,
  RegisterOutput
> {
  constructor(
    private userService: UserService,
    private emailVerificationRepository: EmailVerificationRepository,
    private mailService: MailService,
  ) {
    super();
  }

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const user = await this.userService.create(input);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.emailVerificationRepository.deleteManyRegistrationTokens(
      user.email,
    );

    await this.emailVerificationRepository.create({
      userId: user._id,
      email: user.email,
      token: verificationToken,
      expiresAt,
      type: 'registration',
    });

    try {
      await this.mailService.sendEmailVerification(
        { email: user.email, firstName: user.firstName },
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
}
