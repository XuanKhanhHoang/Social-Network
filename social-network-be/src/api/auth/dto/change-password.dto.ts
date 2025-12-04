import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa' })
  @Matches(/[0-9]/, { message: 'Mật khẩu mới phải chứa ít nhất 1 số' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
