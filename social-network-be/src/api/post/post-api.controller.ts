import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ParseMongoIdPipe } from 'src/share/pipe/parse-mongo-id-pipe';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { CreatePostService } from 'src/use-case/post/create-post/create-post.service';
import { UpdatePostService } from 'src/use-case/post/update-post/update-post.service';
import { GetPostFullService } from 'src/use-case/post/get-post-full/get-post-full.service';
import { SearchPostService } from 'src/use-case/post/search-post/search-post.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { CursorPaginationWithSearchQueryDto } from 'src/share/dto/req/cursor-pagination-with-search-query.dto';

@Controller('posts')
export class PostController {
  constructor(
    private readonly createPostService: CreatePostService,
    private readonly updatePostService: UpdatePostService,
    private readonly getPostFullService: GetPostFullService,
    private readonly searchPostService: SearchPostService,
  ) {}

  @Get('search')
  async searchPosts(
    @GetUserId() userId: string,
    @Query() query: CursorPaginationWithSearchQueryDto,
  ) {
    return this.searchPostService.execute({
      userId,
      query: query.search,
      limit: Number(query.limit || 10),
      cursor: query.cursor,
    });
  }

  @Post('')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUserId() userId: string,
  ) {
    return await this.createPostService.execute({
      data: createPostDto,
      userId,
    });
  }
  @Patch(':id')
  async updatePost(
    @Param('id') postId: string,
    @GetUserId() userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.updatePostService.execute({
      postId,
      userId,
      data: updatePostDto,
    });
  }

  @Get(':id')
  async getPost(
    @Param('id', new ParseMongoIdPipe()) postId: string,
    @GetUserId() userId: string,
  ) {
    return await this.getPostFullService.execute({ postId, userId });
  }
}
