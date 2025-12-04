import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ReportStatus } from 'src/schemas/report.schema';

export class UpdateReportStatusDto {
  @IsNotEmpty()
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}

export class UpdateReportStatusParams {
  @IsNotEmpty()
  @IsMongoId()
  reportId: string;
}
