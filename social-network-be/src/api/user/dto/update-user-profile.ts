import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional } from 'class-validator';
import { IsProvinceCode } from 'src/share/decorators/is-provine-code.decorator';

export class UpdateProfileDto {
  @IsMongoId()
  @IsOptional()
  avatar?: string | null;
  @IsMongoId()
  @IsOptional()
  coverPhoto?: string | null;

  @Transform(({ value }) => value.trim())
  @IsOptional()
  bio?: string;
  @IsOptional()
  @Transform(({ value }) => value.trim())
  work?: string;
  @IsOptional()
  @Transform(({ value }) => value.trim())
  currentLocation?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value.trim()))
  @IsProvinceCode()
  provinceCode?: string;
}
