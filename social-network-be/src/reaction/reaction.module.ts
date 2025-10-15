import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { Reaction, ReactionSchema } from 'src/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactionController } from './reaction.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reaction.name, schema: ReactionSchema },
    ]),
  ],
  providers: [ReactionService],
  exports: [ReactionService],
  controllers: [ReactionController],
})
export class ReactionModule {}
