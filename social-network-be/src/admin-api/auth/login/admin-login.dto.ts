import { IsNotEmpty, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
