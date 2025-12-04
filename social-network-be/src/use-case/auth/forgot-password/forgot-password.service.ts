import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/domains/user/user.repository';
import { MailService } from 'src/share/module/mail/mail.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { UserStatus } from 'src/share/enums/user-status.enum';

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordOutput {
  message: string;
}

@Injectable()
export class ForgotPasswordService extends BaseUseCaseService<
  ForgotPasswordInput,
  ForgotPasswordOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    const { email } = input;

    const user = await this.userRepository.findOne(
      { email, isVerified: true, deletedAt: null },
      { projection: '_id firstName status' },
    );

    if (!user) {
      throw new BadRequestException(
        'Email is not registered or account is not verified',
      );
    }

    if (user.status === UserStatus.LOCKED) {
      throw new BadRequestException('Account is locked');
    }

    const newPassword = this.generatePassword();

    const hashedPassword = await bcrypt.hash(
      newPassword,
      +process.env.PASSWORD_HASH_ROUND,
    );

    await this.userRepository.updateById(user._id.toString(), {
      password: hashedPassword,
    });

    this.mailService
      .sendForgotPasswordEmail(
        { email, firstName: user.firstName },
        newPassword,
      )
      .then(() => {})
      .catch((e) => console.error('Failed to send new password email:', e));

    return {
      message: 'New password has been sent to your email',
    };
  }

  private generatePassword(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const all = upper + lower + numbers;

    let password = '';

    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    for (let i = 0; i < 5; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
