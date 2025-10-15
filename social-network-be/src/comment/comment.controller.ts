import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/req';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ParseMongoIdPipe } from 'src/share/pipe/parse-mongo-id-pipe';
import { GetUserId } from 'src/share/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  @Post('create')
  async createComment(
    @Body() data: CreateCommentDto,
    @GetUserId() userId: string,
  ) {
    return this.commentService.createComment(userId, data);
  }
  @Patch('update/:id')
  async updateComment(
    @Body() data: UpdateCommentDto,
    @Param('id', new ParseMongoIdPipe()) id: string,
    @GetUserId() userId: string,
  ) {
    return this.commentService.updateComment(userId, id, data);
  }
  @Get('gets/:post_id')
  async getComments(
    @Param('post_id', new ParseMongoIdPipe()) postId: string,
    @GetUserId() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.commentService.getPostComments(postId, userId, limit, cursor);
  }
  @Get('get-replies/:comment_id')
  async getReplyComments(
    @GetUserId() userId: string,
    @Param('comment_id', new ParseMongoIdPipe()) comment_id: string,
  ) {
    return this.commentService.getCommentReplies(comment_id, userId);
  }
}
