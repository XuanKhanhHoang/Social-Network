import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { Gender } from 'src/share/enums';
import { UserRepository } from 'src/domains/user/user.repository';
import { PrivacySettings } from 'src/schemas';
import { UserEvents, UserUpdatedEventPayload } from 'src/share/events';

export interface UpdateAccountInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  birthDate?: Date;
  gender?: Gender;
  privacy?: Partial<PrivacySettings>;
}

export interface UpdateAccountOutput {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  birthDate: Date;
  gender: Gender;
  privacy: PrivacySettings;
}

@Injectable()
export class UpdateAccountService extends BaseUseCaseService<
  UpdateAccountInput,
  UpdateAccountOutput
> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emitter: EventEmitter2,
  ) {
    super();
  }

  async execute(input: UpdateAccountInput): Promise<UpdateAccountOutput> {
    const {
      userId,
      firstName,
      lastName,
      phoneNumber,
      birthDate,
      gender,
      privacy,
    } = input;

    const updatePayload: any = {
      firstName,
      lastName,
      phoneNumber,
      birthDate,
      gender,
    };

    if (privacy) {
      updatePayload.privacySettings = privacy;
    }

    const updatedUser = await this.userRepo.updateAccount(
      userId,
      updatePayload,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const eventData: Record<string, any> = {};
    if (firstName !== undefined) eventData.firstName = firstName;
    if (lastName !== undefined) eventData.lastName = lastName;
    if (phoneNumber !== undefined) eventData.phoneNumber = phoneNumber;
    if (birthDate !== undefined) eventData.birthDate = birthDate;
    if (gender !== undefined) eventData.gender = gender;

    if (Object.keys(eventData).length > 0) {
      const eventPayload: UserUpdatedEventPayload = {
        userId: userId,
        newData: eventData,
      };
      this.emitter.emit(UserEvents.updated, eventPayload);
    }

    return {
      _id: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber || null,
      birthDate: updatedUser.birthDate,
      gender: updatedUser.gender,
      privacy: updatedUser.privacySettings,
    };
  }
}
