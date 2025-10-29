import { Module } from '@nestjs/common';
import { UserDocument, UserSchema } from 'src/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user-repository.service';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  providers: [UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UserModule {}
