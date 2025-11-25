import { Controller, Get, Query } from '@nestjs/common';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { GetHomeFeedService } from 'src/use-case/feed/get-home-feed/get-home-feed.service';
import { GetHomeFeedDto } from './dto/get-home-feed.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly getHomeFeedService: GetHomeFeedService) {}

  @Get()
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
