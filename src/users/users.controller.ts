import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        email: 'john@example.com',
        username: 'johndoe',
        displayName: 'John Doe',
        bio: 'Software developer passionate about coding',
        avatarUrl: 'https://example.com/avatar.jpg',
        preferences: { theme: 'dark', notifications: true },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        _count: { followers: 0, following: 0 }
      }
    }
  })
  @ApiConflictResponse({ description: 'Email or username already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users per page', type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search query for username, displayName, or email', example: 'john' })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    schema: {
      example: {
        users: [
          {
            id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            username: 'johndoe',
            displayName: 'John Doe',
            bio: 'Software developer',
            avatarUrl: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            _count: { followers: 5, following: 3 }
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(parseInt(page), parseInt(limit), search);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by query' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query', example: 'john' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users per page', type: Number, example: 10 })
  @ApiOkResponse({
    description: 'Search results retrieved successfully',
    schema: {
      example: {
        users: [
          {
            id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            username: 'johndoe',
            displayName: 'John Doe',
            bio: 'Software developer',
            avatarUrl: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            _count: { followers: 5, following: 3 }
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        query: 'john',
        totalPages: 1
      }
    }
  })
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.usersService.searchUsers(query, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        email: 'john@example.com',
        username: 'johndoe',
        displayName: 'John Doe',
        bio: 'Software developer passionate about coding',
        avatarUrl: 'https://example.com/avatar.jpg',
        preferences: { theme: 'dark', notifications: true },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        _count: { followers: 5, following: 3 }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        email: 'john@example.com',
        username: 'johndoe',
        displayName: 'John Doe Updated',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/new-avatar.jpg',
        preferences: { theme: 'light', notifications: false },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
        _count: { followers: 5, following: 3 }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email or username already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of followers per page', type: Number, example: 10 })
  @ApiOkResponse({
    description: 'Followers retrieved successfully',
    schema: {
      example: {
        followers: [
          {
            id: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
            username: 'janesmith',
            displayName: 'Jane Smith',
            bio: 'Designer',
            avatarUrl: 'https://example.com/jane-avatar.jpg',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getFollowers(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.usersService.getFollowers(id, parseInt(page), parseInt(limit));
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get users that the specified user is following' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of following per page', type: Number, example: 10 })
  @ApiOkResponse({
    description: 'Following users retrieved successfully',
    schema: {
      example: {
        following: [
          {
            id: 'c3d4e5f6-g7h8-9012-3456-789012abcdef',
            username: 'bobwilson',
            displayName: 'Bob Wilson',
            bio: 'Developer',
            avatarUrl: 'https://example.com/bob-avatar.jpg',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getFollowing(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.usersService.getFollowing(id, parseInt(page), parseInt(limit));
  }

  @Post(':id/follow')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({ name: 'id', description: 'User ID to follow', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        followerId: {
          type: 'string',
          description: 'ID of the user who wants to follow',
          example: 'b2c3d4e5-f6g7-8901-2345-678901abcdef'
        }
      },
      required: ['followerId']
    }
  })
  @ApiCreatedResponse({
    description: 'Successfully followed user',
    schema: {
      example: {
        message: 'Successfully followed user',
        follow: {
          followerId: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
          followingId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          createdAt: '2024-01-01T00:00:00Z',
          follower: {
            id: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
            username: 'janesmith',
            displayName: 'Jane Smith'
          },
          following: {
            id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            username: 'johndoe',
            displayName: 'John Doe'
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Already following this user' })
  @ApiBadRequestResponse({ description: 'Cannot follow yourself' })
  async followUser(
    @Param('id') followingId: string,
    @Body('followerId') followerId: string,
  ) {
    return this.usersService.followUser(followerId, followingId);
  }

  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'id', description: 'User ID to unfollow', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        followerId: {
          type: 'string',
          description: 'ID of the user who wants to unfollow',
          example: 'b2c3d4e5-f6g7-8901-2345-678901abcdef'
        }
      },
      required: ['followerId']
    }
  })
  @ApiOkResponse({
    description: 'Successfully unfollowed user',
    schema: {
      example: {
        message: 'Successfully unfollowed user'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Follow relationship not found' })
  async unfollowUser(
    @Param('id') followingId: string,
    @Body('followerId') followerId: string,
  ) {
    return this.usersService.unfollowUser(followerId, followingId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiOkResponse({
    description: 'User statistics retrieved successfully',
    schema: {
      example: {
        userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        followers: 15,
        following: 8,
        polls: 3,
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }
}
