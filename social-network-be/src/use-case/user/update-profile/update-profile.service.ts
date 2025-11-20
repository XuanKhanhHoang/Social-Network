import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateQuery } from 'mongoose';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { MediaUploadDocument, UserDocument } from 'src/schemas';
import { UserEvents, UserUpdatedEventPayload } from 'src/share/events';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface UpdateProfileInput {
  avatar?: string | null;
  coverPhoto?: string | null;
  bio?: string;
  work?: string;
  currentLocation?: string;
  requestingUserId: string;
}
export interface UpdateProfileOutput {
  _id: string;
  avatar?: {
    mediaId: string;
    url: string;
    width?: number;
    height?: number;
  } | null;
  coverPhoto?: {
    mediaId: string;
    url: string;
    width?: number;
    height?: number;
  } | null;
  bio?: string;
  work?: string;
  currentLocation?: string;
  username: string;
}

@Injectable()
export class UpdateProfileService extends BaseUseCaseService<
  UpdateProfileInput,
  UpdateProfileOutput
> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mediaUploadService: MediaUploadService,
    private readonly emitter: EventEmitter2,
  ) {
    super();
  }
  private readonly logger = new Logger(UpdateProfileService.name);
  async execute(input: UpdateProfileInput): Promise<UpdateProfileOutput> {
    const { avatar, coverPhoto, bio, work, currentLocation, requestingUserId } =
      input;

    const mediaIdsToFind: string[] = [];
    if (typeof avatar === 'string') mediaIdsToFind.push(avatar);
    if (typeof coverPhoto === 'string') mediaIdsToFind.push(coverPhoto);
    let avatarMedia: (MediaUploadDocument & { _id: string }) | undefined =
      undefined;
    let coverMedia: (MediaUploadDocument & { _id: string }) | undefined =
      undefined;
    if (mediaIdsToFind.length > 0) {
      const medias = await this.mediaUploadService.findMedia(mediaIdsToFind);
      if (medias.length !== mediaIdsToFind.length) {
        throw new BadRequestException('Some media not found or expired');
      }
      if (typeof avatar === 'string') {
        avatarMedia = medias.shift();
      }
      if (typeof coverPhoto === 'string') {
        coverMedia = medias.shift();
      }
    }

    const updateData: UpdateQuery<UserDocument> = {
      bio,
      work,
      currentLocation,
    };
    const eventNewData: Record<string, any> = {};

    if (avatar === undefined) {
    } else if (avatar === null) {
      updateData.avatar = null;
      eventNewData.avatar = null;
    } else {
      updateData.avatar = {
        mediaId: avatarMedia._id,
        url: avatarMedia.url,
        mediaType: avatarMedia.mediaType,
        width: avatarMedia.width,
        height: avatarMedia.height,
      };
      eventNewData.avatar = avatarMedia.url;
    }

    if (coverPhoto === undefined) {
    } else if (coverPhoto === null) {
      updateData.coverPhoto = null;
    } else {
      updateData.coverPhoto = {
        mediaId: coverMedia._id,
        url: coverMedia.url,
        mediaType: coverMedia.mediaType,
        width: coverMedia.width,
        height: coverMedia.height,
      };
    }
    let mediaIdsToCancelConfirm: string[] = [];

    try {
      const oldUser = await this.userRepo.updateByIdAndGet<
        'avatar' | 'coverPhoto'
      >(requestingUserId, updateData, {
        new: false,
        projection: {
          avatar: 1,
          coverPhoto: 1,
        },
      });
      if (avatar != undefined && oldUser.avatar)
        mediaIdsToCancelConfirm.push(oldUser.avatar.mediaId.toString());
      if (coverPhoto != undefined && oldUser.coverPhoto)
        mediaIdsToCancelConfirm.push(oldUser.coverPhoto.mediaId.toString());
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Something went wrong on update user profile',
      );
    }
    this.mediaUploadService.confirmUploads(mediaIdsToFind, requestingUserId);
    this.mediaUploadService.cancelConfirmUploads(
      mediaIdsToCancelConfirm,
      requestingUserId,
    );

    if (Object.keys(eventNewData).length > 0) {
      const payload: UserUpdatedEventPayload = {
        userId: requestingUserId,
        newData: eventNewData,
      };
      this.emitter.emit(UserEvents.updated, payload);
    }

    return {
      _id: requestingUserId,
      username: eventNewData.username,
      ...updateData,
    };
  }
}
