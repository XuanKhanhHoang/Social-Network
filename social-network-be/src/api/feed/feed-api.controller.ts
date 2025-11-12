import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/domains/auth/jwt-auth.guard';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { GetHomeFeedService } from 'src/use-case/feed/get-home-feed/get-home-feed.service';
import { GetHomeFeedDto } from './dto/get-home-feed.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly getHomeFeedService: GetHomeFeedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getHomeFeed(
    @Query() query: GetHomeFeedDto,
    @GetUserId() userId: string,
  ) {
    return this.getHomeFeedService.execute({
      userId: userId,
      cursor: query.cursor,
      limit: query.limit,
    });
  }
}
