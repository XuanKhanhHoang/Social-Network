import { ConflictException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MailService } from 'src/share/module/mail/mail.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { EmailVerificationRepository } from 'src/domains/auth/services/email-verification.repository';
import { Gender } from 'src/share/enums';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { UserRepository } from 'src/domains/user/user.repository';
import * as bcrypt from 'bcryptjs';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  publicKey: string;
  keyVault: {
    salt: string;
    iv: string;
    ciphertext: string;
  };
}
export interface RegisterOutput {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    username: string;
  };
}
@Injectable()
export class RegisterService extends BaseUseCaseService<
  RegisterInput,
  RegisterOutput
> {
  constructor(
    private userRepo: UserRepository,
    private userDomainsService: UserDomainsService,
    private emailVerificationRepository: EmailVerificationRepository,
    private mailService: MailService,
  ) {
    super();
  }

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const username = await this.userDomainsService.generateUniqueUsername(
      input.firstName,
      input.lastName,
    );

    const password = await bcrypt.hash(
      input.password,
      +process.env.PASSWORD_HASH_ROUND,
    );

    const user = (
      await this.userRepo.createUser({ ...input, username, password })
    ).toObject();

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

    this.mailService
      .sendEmailVerification(
        { email: user.email, firstName: user.firstName },
        verificationToken,
      )
      .then(() => {})
      .catch((e) => console.error('Failed to send verification email:', e));

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    };
  }
}
