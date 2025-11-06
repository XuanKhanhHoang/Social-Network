import { Injectable } from '@nestjs/common';
import { PaginatedPhotos } from 'src/domains/post/interfaces/post.type';
import { PostRepository } from 'src/domains/post/post.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { UserPrivacy } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserPhotosInput {
  username: string;
  requestingUserId?: string;
  limit?: number;
  page?: number;
}

@Injectable()
export class GetUserPhotosService extends BaseUseCaseService<
  GetUserPhotosInput,
  PaginatedPhotos
> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly postRepo: PostRepository,
  ) {
    super();
  }

  async execute(input: GetUserPhotosInput): Promise<PaginatedPhotos> {
    const { username, requestingUserId } = input;
    const userPrivacies: UserPrivacy[] = [UserPrivacy.PUBLIC];
    if (requestingUserId) {
      const profileUser = (
        await this.userRepo.findByUsername(username)
      ).toObject();
      if (requestingUserId == profileUser._id) {
        userPrivacies.push(UserPrivacy.PRIVATE, UserPrivacy.FRIENDS);
      } else if (
        await this.userRepo.areFriends(
          profileUser._id as string,
          requestingUserId,
        )
      ) {
        userPrivacies.push(UserPrivacy.FRIENDS);
      }
    }

    return this.postRepo.findPhotosForUser(
      username,
      userPrivacies,
      input.limit,
      input.page,
    );
  }
}
