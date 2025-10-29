import { IsOptional, IsEnum } from 'class-validator';
import { UserPrivacy } from 'src/share/enums';
import { CursorPaginationQueryDto } from 'src/share/dto/req/cursor-pagination-query.dto';
export class GetPostsByCursorDto extends CursorPaginationQueryDto {
  @IsOptional()
  @IsEnum(UserPrivacy)
  visibility?: UserPrivacy;
}
