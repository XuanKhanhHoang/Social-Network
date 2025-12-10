import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReverseReportDto {
  @IsString()
  @IsNotEmpty({ message: 'Lý do đảo ngược là bắt buộc' })
  @MaxLength(500)
  reason: string;
}
