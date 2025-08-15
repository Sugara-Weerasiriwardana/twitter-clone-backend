import { Controller, Get, Param } from '@nestjs/common';
import { FollowersService } from './followers.service';

@Controller('users/:userId/follow')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Get('counts')
  getCounts(@Param('userId') userId: string) {
    return this.followersService.getFollowerFollowingCounts(userId);
  }

  @Get('followers')
  getFollowers(@Param('userId') userId: string) {
    return this.followersService.getFollowersCount(userId).then(count => ({ followers: count }));
  }

  @Get('following')
  getFollowing(@Param('userId') userId: string) {
    return this.followersService.getFollowingCount(userId).then(count => ({ following: count }));
  }
}
