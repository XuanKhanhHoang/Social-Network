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
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ParseMongoIdPipe } from 'src/share/pipe/parse-mongo-id-pipe';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { CreateCommentService } from 'src/use-case/comment/create-comment/create-comment.service';
import { UpdateCommentService } from 'src/use-case/comment/update-comment/update-comment.service';
import { GetPostCommentsService } from 'src/use-case/comment/get-post-comments/get-post-comments.service';
import { GetReplyCommentsService } from 'src/use-case/comment/get-reply-comments/get-reply-comments.service';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(
    private readonly createCommentService: CreateCommentService,
    private readonly updateCommentService: UpdateCommentService,
    private readonly getPostCommentsService: GetPostCommentsService,
    private readonly getReplyCommentsService: GetReplyCommentsService,
  ) {}

  @Post()
  async createComment(
    @Body() data: CreateCommentDto,
    @GetUserId() userId: string,
  ) {
    return this.createCommentService.execute({ ...data, authorId: userId });
  }

  @Patch(':id')
  async updateComment(
    @Body() data: UpdateCommentDto,
    @Param('id', ParseMongoIdPipe) id: string,
    @GetUserId() userId: string,
  ) {
    return this.updateCommentService.execute({
      ...data,
      commentId: id,
      userId,
    });
  }

  @Get()
  async getPostComments(
    @Query('postId', ParseMongoIdPipe) postId: string,
    @GetUserId() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.getPostCommentsService.execute({
      postId,
      userId,
      cursor,
      limit,
    });
  }

  @Get(':commentId/replies')
  async getReplyComments(
    @Param('commentId', ParseMongoIdPipe) commentId: string,
    @GetUserId() userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number,
  ) {
    return this.getReplyCommentsService.execute({
      commentId,
      userId,
      cursor,
      limit,
    });
  }
}
