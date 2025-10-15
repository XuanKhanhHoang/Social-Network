import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostVisibility } from 'src/share/enums';
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
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  //   @IsOptional()
  //   @IsString()
  //   parentPost?: string;
}
export class PostMediaDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
