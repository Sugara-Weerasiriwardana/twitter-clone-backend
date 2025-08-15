import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowersService {
  constructor(private prisma: PrismaService) {}

  async getFollowersCount(userId: string) {
    return this.prisma.follow.count({
      where: { followingId: userId },
    });
  }

  async getFollowingCount(userId: string) {
    return this.prisma.follow.count({
      where: { followerId: userId },
    });
  }

  async getFollowerFollowingCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.getFollowersCount(userId),
      this.getFollowingCount(userId),
    ]);

    return { followers, following };
  }
}
