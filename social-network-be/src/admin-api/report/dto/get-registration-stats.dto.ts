import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';

export enum ReportMode {
  DAY = '1d',
  WEEK = '1w',
  MONTH = '1m',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  YEAR = '1y',
}

export class GetRegistrationStatsDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @IsEnum(ReportMode)
  mode: ReportMode;
}
