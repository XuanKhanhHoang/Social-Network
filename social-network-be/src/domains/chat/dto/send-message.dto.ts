import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MessageType } from 'src/schemas/message.schema';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @IsString()
  @IsNotEmpty()
  content: string; // Base64

  @IsString()
  @IsNotEmpty()
  nonce: string; // Base64
}
