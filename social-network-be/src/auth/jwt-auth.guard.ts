import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const accessToken = request.cookies?.accessToken;
    const refreshToken = request.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No tokens provided');
    }
    try {
      // Try to verify access token
      if (accessToken) {
        const payload: { _id: string; iat: number; exp: number } =
          this.jwtService.verify(accessToken);
        if (!payload._id) throw new Error();
        request['user'] = payload;
        return true;
      }
      if (refreshToken) throw new Error();
    } catch (error) {
      // Access token expired, try refresh token
      if (refreshToken) {
        try {
          const payload: { _id: string; iat: number; exp: number } =
            this.jwtService.verify(refreshToken);

          // Generate new access token
          const newAccessToken = this.jwtService.sign(
            { _id: payload._id },
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
          );
          // Set new access token cookie
          response.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge:
              Number(process.env.JWT_ACCESS_EXPIRES_IN?.slice(0, -1) || '15') *
              60 *
              1000, // 15 minutes
          });

          request['user'] = payload;
          return true;
        } catch (refreshError) {
          // Both tokens invalid
          response.clearCookie('accessToken');
          response.clearCookie('refreshToken');
          throw new UnauthorizedException('Invalid tokens');
        }
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
