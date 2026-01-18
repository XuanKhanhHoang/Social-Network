import {
    IsString,
    IsNotEmpty,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    IsOptional,
    MaxLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(19)
  @IsString({ each: true })
  memberIds: string[];

  @IsString()
  @IsOptional()
  avatar?: string;
}
