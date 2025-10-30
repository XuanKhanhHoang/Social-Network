import { IsString } from 'class-validator';
export class ConfirmTempMediaDto {
  @IsString()
  tempId: string;
}
