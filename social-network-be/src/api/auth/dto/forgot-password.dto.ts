import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Vui lòng nhập email hợp lệ' })
  email: string;
}
