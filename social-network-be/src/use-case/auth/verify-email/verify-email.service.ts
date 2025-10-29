import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailVerificationRepository } from 'src/domains/auth/services/email-verification.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { UserService } from 'src/user/services';

export interface VerifyEmailInput {
  token: string;
}
export interface VerifyEmailOutput {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    emailVerified: boolean;
  };
}
@Injectable()
export class VerifyEmailService extends BaseUseCaseService<
  VerifyEmailInput,
  VerifyEmailOutput
> {
  constructor(
    private emailVerificationRepository: EmailVerificationRepository,
    private userService: UserService,
  ) {
    super();
  }

  async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    const { token } = input;
    const verification =
      await this.emailVerificationRepository.findOneByToken(token);

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.userService.markUserAsVerified(
      (verification.userId as any)._id.toString(),
    );

    await this.emailVerificationRepository.markAsUsed(verification);

    return {
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.isVerified,
      },
    };
  }
}
