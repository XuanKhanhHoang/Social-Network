import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/share/dto/pagination.dto';
import { ReportStatus, ReportTargetType } from 'src/schemas/report.schema';

export class GetReportsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
