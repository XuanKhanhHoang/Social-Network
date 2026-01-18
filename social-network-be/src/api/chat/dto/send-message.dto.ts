import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  ValidateIf,
} from 'class-validator';
import { MessageType } from 'src/schemas/message.schema';

export class SendMessageDto {
  @ValidateIf((o) => !o.conversationId)
  @IsString()
  @IsNotEmpty()
  receiverId?: string;

  @ValidateIf((o) => !o.receiverId)
  @IsString()
  @IsNotEmpty()
  conversationId?: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  // === 1-1 Text ===
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  nonce?: string;

  // === Media (1-1 & Group) ===
  @IsString()
  @IsOptional()
  mediaNonce?: string;

  // === Group Text (multi-encrypt) ===
  @Transform(({ value }) => JSON.parse(value))
  @IsObject()
  @IsOptional()
  encryptedContents?: Record<string, string>;

  // === Group Media (envelope encryption) ===
  @Transform(({ value }) => JSON.parse(value))
  @IsObject()
  @IsOptional()
  encryptedFileKeys?: Record<string, string>;

  @IsString()
  @IsOptional()
  keyNonce?: string;
}
