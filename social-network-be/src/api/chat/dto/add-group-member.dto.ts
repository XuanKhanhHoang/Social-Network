import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class AddGroupMemberDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(19)
  @IsString({ each: true })
  memberIds: string[];
}
