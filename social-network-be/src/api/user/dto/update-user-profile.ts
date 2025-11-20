import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional } from 'class-validator';

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
}
