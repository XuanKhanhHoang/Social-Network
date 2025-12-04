import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailVerification(
    user: {
      firstName: string;
      email: string;
    },
    token: string,
  ) {
    console.log('Sending email verification to:', user.email);
    const url = `${process.env.FRONTEND_URL}/register/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Chào mừng tới ThreshCity! Vui lòng xác nhận email của bạn',
      template: './confirmation',
      context: {
        name: user.firstName,
        url,
      },
    });
  }

  async sendForgotPasswordEmail(
    user: {
      firstName: string;
      email: string;
    },
    newPassword: string,
  ) {
    console.log('Sending forgot password email to:', user.email);

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'ThreshCity - Mật khẩu mới của bạn',
      template: './forgot-password',
      context: {
        name: user.firstName,
        newPassword,
      },
    });
  }

  async sendPlainEmail(to: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  async sendHtmlEmail(to: string, subject: string, html: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }

  async sendEmailWithAttachment(
    to: string,
    subject: string,
    text: string,
    attachmentPath: string,
  ) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
      attachments: [
        {
          filename: 'attachment.pdf',
          path: attachmentPath,
        },
      ],
    });
  }
}
