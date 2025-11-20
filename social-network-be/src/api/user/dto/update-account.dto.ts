import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Gender, UserPrivacy } from 'src/share/enums';

export class PrivacySettingsDto {
  @IsOptional()
  @IsEnum(UserPrivacy)
  work?: UserPrivacy;

  @IsOptional()
  @IsEnum(UserPrivacy)
  currentLocation?: UserPrivacy;

  @IsOptional()
  @IsEnum(UserPrivacy)
  friendList?: UserPrivacy;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @ValidateIf(({ value }) => value !== null)
  @IsString()
  @Matches(/^[0-9+\-\s()]*$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phoneNumber?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacy?: PrivacySettingsDto;
}
