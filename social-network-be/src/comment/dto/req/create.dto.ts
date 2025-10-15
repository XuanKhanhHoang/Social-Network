import { IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';
import { AtLeastOneField } from 'src/share/decorators/at-least-one-field.decorator';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';

export class CreateCommentDto {
  @IsString()
  @IsMongoId()
  postId: string;

  @IsOptional()
  @IsObject()
  content: TiptapDocument;

  @IsOptional()
  @IsMongoId()
  mediaId?: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @AtLeastOneField('content', 'mediaId')
  dummyField?: never;
}
