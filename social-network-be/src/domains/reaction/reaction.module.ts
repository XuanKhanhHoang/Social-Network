import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactionDocument, ReactionSchema } from 'src/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReactionDocument.name, schema: ReactionSchema },
    ]),
  ],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
