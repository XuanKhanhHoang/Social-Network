import { Module } from '@nestjs/common';
import { UserDocument, UserSchema } from 'src/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDomainsService } from './user-domains.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  providers: [UserRepository, UserDomainsService],
  exports: [UserRepository, UserDomainsService],
})
export class UserModule {}
