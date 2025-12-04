import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/share/dto/pagination.dto';

export class GetPostsDto extends PaginationDto {
  @IsOptional()
  @IsMongoId()
  searchId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeDeleted?: boolean;
}
