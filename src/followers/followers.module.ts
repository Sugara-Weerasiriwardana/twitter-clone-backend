import { Module } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FollowersController],
  providers: [FollowersService, PrismaService],
})
export class FollowersModule {}
