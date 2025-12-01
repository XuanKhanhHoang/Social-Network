import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetPublicKeyInput {
  userId: string;
}

export interface GetPublicKeyOutput {
  userId: string;
  publicKey: string;
}

@Injectable()
export class GetPublicKeyService extends BaseUseCaseService<
  GetPublicKeyInput,
  GetPublicKeyOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: GetPublicKeyInput): Promise<GetPublicKeyOutput> {
    const user = await this.userRepository.findOne(
      { _id: input.userId },
      { projection: 'publicKey' },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user._id.toString(),
      publicKey: user.publicKey,
    };
  }
}
