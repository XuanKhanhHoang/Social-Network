import { Injectable } from '@nestjs/common';
import { SubMediaModel } from 'src/domains/media-upload/interfaces/media';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetMePreviewProfileInput {
  userId: string;
}
export interface GetMePreviewProfileOutput {
  firstName: string;
  lastName: string;
  username: string;
  avatar: SubMediaModel<string> | null;
}

@Injectable()
export class GetMePreviewProfileService extends BaseUseCaseService<
  GetMePreviewProfileInput,
  GetMePreviewProfileOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }
  async execute(
    input: GetMePreviewProfileInput,
  ): Promise<GetMePreviewProfileOutput> {
    const { userId } = input;
    const res = await this.userRepository.findByIdBasic(userId);
    return {
      firstName: res.firstName,
      lastName: res.lastName,
      username: res.username,
      avatar: {
        mediaId: res.avatar?.mediaId.toString(),
        url: res.avatar?.url,
        width: res.avatar?.width,
        height: res.avatar?.height,
        mediaType: res.avatar?.mediaType,
      },
    };
  }
}
