import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/domains/auth/services/auth.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { UserRole } from 'src/share/enums/user-role.enum';
import { UserStatus } from 'src/share/enums/user-status.enum';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type AdminLoginInput = {
  username: string;
  password: string;
};

export type AdminLoginOutput = {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

@Injectable()
export class AdminLoginService extends BaseUseCaseService<
  AdminLoginInput,
  AdminLoginOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async execute(input: AdminLoginInput): Promise<AdminLoginOutput> {
    const { username, password } = input;
    console.log(username, password);
    const user = (
      await this.userRepository.findOne(
        { username, deletedAt: null },
        { projection: '+password +role +status' },
      )
    )?.toObject();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. Admin only.');
    }

    if (user.status === UserStatus.LOCKED) {
      throw new ForbiddenException('Account is locked.');
    }

    const { accessToken, refreshToken } = this.authService.generateTokens(
      user._id.toString(),
    );

    return {
      message: 'Admin login successful',
      accessToken,
      refreshToken,
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
