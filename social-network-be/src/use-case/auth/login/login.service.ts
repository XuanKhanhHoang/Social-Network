import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/domains/auth/services/auth.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from 'src/domains/user/user.repository';
export type LoginInput = {
  email: string;
  password: string;
};
export type LoginOutput = {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    username: string;
  };
  accessToken: string;
  refreshToken: string;
  keyVault: {
    salt: string;
    iv: string;
    ciphertext: string;
  };
};
@Injectable()
export class LoginService extends BaseUseCaseService<LoginInput, LoginOutput> {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
  ) {
    super();
  }
  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password } = input;

    const user = (
      await this.userRepository.findOne(
        { email, isVerified: true },
        { projection: '+password +keyVault' },
      )
    )?.toObject();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.authService.generateTokens(
      user._id.toString(),
    );

    return {
      message: 'Login successful',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        username: user.username,
      },
      accessToken,
      refreshToken,
      keyVault: user.keyVault,
    };
  }
}
