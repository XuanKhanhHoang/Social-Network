import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReportTargetType } from 'src/schemas/report.schema';

export class SubmitReportDto {
  @IsNotEmpty()
  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @IsNotEmpty()
  @IsString()
  targetId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason: string;
}
