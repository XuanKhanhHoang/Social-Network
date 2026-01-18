import { IsString, IsNotEmpty } from 'class-validator';

export class AssignGroupAdminDto {
  @IsString()
  @IsNotEmpty()
  newAdminId: string;
}
