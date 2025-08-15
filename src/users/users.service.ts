import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto) {
    try {
      // Check if email already exists
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: createUserDto.email }
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      // Check if username already exists
      if (createUserDto.username) {
        const existingUsername = await this.prisma.user.findUnique({
          where: { username: createUserDto.username }
        });

        if (existingUsername) {
          throw new ConflictException('Username already exists');
        }
      }

      const user = await this.prisma.user.create({
        data: createUserDto,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          preferences: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      });

      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  /**
   * Get all users with pagination and search
   */
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      whereClause = {
        OR: [
          { username: { contains: search } },
          { displayName: { contains: search } },
          { email: { contains: search } },
        ]
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where: whereClause })
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get a user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Search users by query
   */
  async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const whereClause = {
      OR: [
        { username: { contains: query } },
        { displayName: { contains: query } },
        { email: { contains: query } },
      ]
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where: whereClause })
    ]);

    return {
      users,
      total,
      page,
      limit,
      query,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update a user
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check for email conflicts if email is being updated
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailConflict = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email }
      });

      if (emailConflict) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check for username conflicts if username is being updated
    if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
      const usernameConflict = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username }
      });

      if (usernameConflict) {
        throw new ConflictException('Username already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          }
        }
      }
    });

    return updatedUser;
  }

  /**
   * Get user followers
   */
  async getFollowers(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              bio: true,
              avatarUrl: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.follow.count({
        where: { followingId: userId }
      })
    ]);

    return {
      followers: followers.map(f => f.follower),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get user following
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              bio: true,
              avatarUrl: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.follow.count({
        where: { followerId: userId }
      })
    ]);

    return {
      following: following.map(f => f.following),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string) {
    // Check if both users exist
    const [follower, following] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId } }),
      this.prisma.user.findUnique({ where: { id: followingId } })
    ]);

    if (!follower) {
      throw new NotFoundException('Follower user not found');
    }

    if (!following) {
      throw new NotFoundException('User to follow not found');
    }

    // Check if trying to follow self
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    // Create follow relationship
    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        },
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
          }
        }
      }
    });

    return {
      message: 'Successfully followed user',
      follow
    };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string) {
    // Check if follow relationship exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (!existingFollow) {
      throw new NotFoundException('Follow relationship not found');
    }

    // Delete follow relationship
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    return {
      message: 'Successfully unfollowed user'
    };
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    return !!follow;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            polls: true,
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId,
      followers: user._count.followers,
      following: user._count.following,
      polls: user._count.polls,
      createdAt: user.createdAt
    };
  }
}
