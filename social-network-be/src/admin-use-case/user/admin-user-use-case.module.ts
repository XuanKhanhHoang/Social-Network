import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { GetUsersService } from './get-users/get-users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [GetUsersService],
  exports: [GetUsersService],
})
export class AdminUserUseCaseModule {}
