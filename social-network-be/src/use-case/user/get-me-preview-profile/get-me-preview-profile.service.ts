import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user-repository.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetMePreviewProfileInput {
  userId: string;
}
export interface GetMePreviewProfileOutput {
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
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
    return this.userRepository.findByIdBasic(userId);
  }
}
