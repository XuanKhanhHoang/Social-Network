import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationQueryDto } from './cursor-pagination-query.dto';
import { Transform } from 'class-transformer';

export class CursorPaginationWithSearchQueryDto extends CursorPaginationQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}
