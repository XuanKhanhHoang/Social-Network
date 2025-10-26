import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { EmailVerification } from 'src/schemas/email-verification.schema';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/services';
import { RegisterDto } from './dtos/req/register.dto';
import { VerifyEmailResponseDto } from './dtos/res/verify-email.dto';
import { LoginDto } from './dtos/req';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmailVerification.name)
    private emailVerificationModel: Model<EmailVerification>,
    private jwtService: JwtService,
    private mailService: MailService,
    private userService: UserService,
  ) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(process.env.JWT_ACCESS_EXPIRES_IN.slice(0, -1)) * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(process.env.JWT_REFRESH_EXPIRES_IN.slice(0, -1)) *
        24 *
        60 *
        60 *
        1000,
    });
  }
  private generateTokens(userId: string) {
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
    return this.userService.findByIdBasic(userId);
  }

  async validateUser(
    userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findByIdBasic(userId);
    if (!user) {
      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');

      throw new NotFoundException('User not found');
    }
    return user;
  }

  async register(registerDto: RegisterDto, res: Response) {
    const user = await this.userService.create(registerDto);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await this.emailVerificationModel.deleteMany({
      email: user.email,
      type: 'registration',
    });

    const emailVerification = new this.emailVerificationModel({
      userId: user._id,
      email: user.email,
      token: verificationToken,
      expiresAt,
      type: 'registration',
    });

    await emailVerification.save();
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
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.isVerified,
      },
    };
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponseDto> {
    const verification = await this.emailVerificationModel
      .findOne({
        token,
        expiresAt: { $gt: new Date() },
        isUsed: false,
      })
      .populate('userId');

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.userService.markUserAsVerified(
      verification.userId._id.toString(),
    );

    verification.isUsed = true;
    await verification.save();

    return {
      message: 'Email verified successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.isVerified,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.emailVerificationModel.deleteMany({
      email,
      type: 'registration',
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const emailVerification = new this.emailVerificationModel({
      userId: user._id,
      email: user.email,
      token: verificationToken,
      expiresAt,
      type: 'registration',
    });

    await emailVerification.save();

    await this.mailService.sendEmailVerification(
      { email: user.email, firstName: user.firstName },
      verificationToken,
    );

    return { message: 'Verification email sent successfully' };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmailAndVerified(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString(),
    );
    this.setCookies(res, accessToken, refreshToken);

    return {
      message: 'Login successful',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }

  async logout(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }
}
