import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ReactionTargetType, ReactionType } from 'src/share/enums';

export class ToggleReactionDto {
  @IsMongoId()
  @IsNotEmpty()
  targetId: string;

  @IsEnum(ReactionTargetType)
  @IsNotEmpty()
  targetType: ReactionTargetType;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  reactionType: ReactionType;
}
