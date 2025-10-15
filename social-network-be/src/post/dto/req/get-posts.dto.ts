import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PostVisibility } from 'src/share/enums';
import { CursorPaginationQueryDto } from 'src/share/dto/req/cursor-pagination-query.dto';
export class GetPostsByCursorDto extends CursorPaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}
