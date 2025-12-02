import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { MessageType } from 'src/schemas/message.schema';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @IsString()
  @IsOptional()
  content?: string; // Base64

  @IsString()
  @IsOptional()
  nonce?: string; // Base64

  @IsString()
  @IsOptional()
  mediaNonce?: string;
}
