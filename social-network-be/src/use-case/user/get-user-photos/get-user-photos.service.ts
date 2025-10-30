import { Injectable } from '@nestjs/common';
import { PaginatedPhotos } from 'src/domains/post/interfaces/post.type';
import { PostService } from 'src/domains/post/post.service';
import { UserService } from 'src/domains/user/user.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserPhotosInput {
  username: string;
  requestingUserId: string;
  limit?: number;
  page?: number;
}

@Injectable()
export class GetUserPhotosService extends BaseUseCaseService<
  GetUserPhotosInput,
  PaginatedPhotos
> {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {
    super();
  }

  async execute(input: GetUserPhotosInput): Promise<PaginatedPhotos> {
    const { username, requestingUserId } = input;
    const { visiblePrivacyLevels } =
      await this.userService.getVisiblePrivacyLevels(
        username,
        requestingUserId,
      );
    return this.postService.getUserPhotos(
      username,
      visiblePrivacyLevels,
      input.limit,
      input.page,
    );
  }
}
