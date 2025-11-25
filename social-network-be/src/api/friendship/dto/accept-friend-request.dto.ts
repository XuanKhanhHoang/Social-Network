import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  requesterId: string;
}
