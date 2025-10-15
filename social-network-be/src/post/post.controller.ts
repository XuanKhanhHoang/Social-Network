import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePostDto } from './dto/req/create-post.dto';
import { UpdatePostDto } from './dto/req/update-post.dto';
import { GetPostsByCursorDto } from './dto/req/get-posts.dto';
import { ParseMongoIdPipe } from 'src/share/pipe/parse-mongo-id-pipe';
import { GetUserId } from 'src/share/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUserId() userId: string,
  ) {
    return await this.postService.createPost(createPostDto, userId);
  }
  @Patch('update/:id')
  async updatePost(
    @Param('id') postId: string,
    @GetUserId() userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postService.updatePost(postId, userId, updatePostDto);
  }
  @Get('gets')
  async getPosts(
    @Query() query: GetPostsByCursorDto,
    @GetUserId() userId: string,
  ) {
    return await this.postService.getPostsByCursor(query, userId);
  }

  @Get(':id')
  async getPost(
    @Param('id', new ParseMongoIdPipe()) postId: string,
    @GetUserId() userId: string,
  ) {
    return await this.postService.getPostById(postId, userId);
  }
}
