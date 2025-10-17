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
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(
    @Body() data: CreateCommentDto,
    @GetUserId() userId: string,
  ) {
    return this.commentService.createComment(userId, data);
  }

  @Patch(':id')
  async updateComment(
    @Body() data: UpdateCommentDto,
    @Param('id', ParseMongoIdPipe) id: string,
    @GetUserId() userId: string,
  ) {
    return this.commentService.updateComment(userId, id, data);
  }

  @Get()
  async getPostComments(
    @Query('postId', ParseMongoIdPipe) postId: string,
    @GetUserId() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.commentService.getPostComments(postId, userId, limit, cursor);
  }

  @Get(':commentId/replies')
  async getReplyComments(
    @Param('commentId', ParseMongoIdPipe) commentId: string,
    @GetUserId() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number,
  ) {
    return this.commentService.getCommentReplies(
      commentId,
      userId,
      limit,
      cursor,
    );
  }
}
