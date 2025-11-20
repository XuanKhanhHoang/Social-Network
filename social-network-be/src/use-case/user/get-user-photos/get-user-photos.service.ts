import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PostPhotoModel } from 'src/domains/post/interfaces';
import { PostRepository } from 'src/domains/post/post.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { UserPrivacy } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserPhotosInput {
  username: string;
  requestingUserId: string;
  limit?: number;
  cursor?: number;
}

export interface GetUserPhotosOutput
  extends BeCursorPaginated<PostPhotoModel<Types.ObjectId, Types.ObjectId>> {}

@Injectable()
export class GetUserPhotosService extends BaseUseCaseService<
  GetUserPhotosInput,
  GetUserPhotosOutput
> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly postRepo: PostRepository,
  ) {
    super();
  }

  async execute(input: GetUserPhotosInput): Promise<GetUserPhotosOutput> {
    const { username, requestingUserId, limit = 9, cursor } = input;
    const userPrivacies: UserPrivacy[] = [UserPrivacy.PUBLIC];
    let userId = (await this.userRepo.getIdBysUsername(username)).toString();
    if (!userId) throw new NotFoundException('User not found');

    if (requestingUserId == userId) {
      userPrivacies.push(UserPrivacy.PRIVATE, UserPrivacy.FRIENDS);
    } else if (
      await this.userRepo.areFriends(userId as string, requestingUserId)
    ) {
      userPrivacies.push(UserPrivacy.FRIENDS);
    }

    const res = await this.postRepo.findPhotosForUser(
      userId,
      userPrivacies,
      limit,
      cursor,
    );
    return {
      data: res.photos,
      pagination: {
        hasMore: res.nextCursor !== null,
        nextCursor: res.nextCursor + '',
      },
    };
  }
}
