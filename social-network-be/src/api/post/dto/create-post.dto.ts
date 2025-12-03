import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsEnum,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserPrivacy } from 'src/share/enums';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';

export class CreatePostDto {
  @IsObject()
  content: TiptapDocument;

  @IsOptional()
  @IsString()
  backgroundValue?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostMediaDto)
  media?: PostMediaDto[];

  @IsOptional()
  @IsEnum(UserPrivacy)
  visibility?: UserPrivacy;

  @IsOptional()
  @IsString()
  parentPostId?: string;
}
export class PostMediaDto {
  @IsString()
  mediaId: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  caption?: string;
}
