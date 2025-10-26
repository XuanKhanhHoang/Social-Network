import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { User, UserSchema } from 'src/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './services/user-repository.service';
import {
  FriendshipService,
  UserPrivacyService,
  UserProfileService,
  UserService,
} from './services';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PostModule,
  ],
  providers: [
    UserRepository,
    UserPrivacyService,
    UserService,
    FriendshipService,
    UserProfileService,
  ],
  controllers: [UserController],
  exports: [
    UserRepository,
    UserPrivacyService,
    UserService,
    FriendshipService,
    UserProfileService,
  ],
})
export class UserModule {}
