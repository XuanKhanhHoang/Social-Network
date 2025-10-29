import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/services';
// BỎ: Rất nhiều import đã được chuyển sang Use Case

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}
  generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { _id: userId },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { _id: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  async validateUserID(userId: string) {
    const user = await this.userService.findByIdBasic(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
