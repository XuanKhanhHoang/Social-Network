import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/domains/auth/services/auth.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/services';
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
  };
  accessToken: string;
  refreshToken: string;
};
@Injectable()
export class LoginService extends BaseUseCaseService<LoginInput, LoginOutput> {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {
    super();
  }
  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password } = input;

    const user = await this.userService.findByEmailAndVerified(email);
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
      },
      accessToken,
      refreshToken,
    };
  }
}
