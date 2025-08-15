import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DatabaseIndexesService } from '../prisma/database-indexes.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly databaseIndexesService: DatabaseIndexesService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ 
    summary: 'Create a new post (supports text, media uploads, and polls)',
    description: `Post API examples
   `
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Post content',
          example: 'What\'s your favorite programming language? Vote now! #coding'
        },
        authorId: {
          type: 'string',
          description: 'Author ID',
          example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
        },
        hashtags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of hashtags',
          example: ['coding', 'poll']
        },
        mentions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user mentions',
          example: ['@john', '@jane']
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Media files to upload'
        },
        'poll[question]': { 
          type: 'string', 
          example: 'What\'s your favorite programming language?',
          description: 'Poll question'
        },
        'poll[options][]': { 
          type: 'array', 
          items: { type: 'string' },
          example: ['JavaScript', 'Python', 'Java', 'TypeScript'],
          description: 'Poll options array'
        },
        'poll[expiresAt]': { 
          type: 'string', 
          format: 'date-time', 
          example: '2024-12-31T23:59:59Z',
          description: 'Poll expiration date'
        },
        'poll[userId]': { 
          type: 'string', 
          example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          description: 'User ID who created the poll'
        }
      },
      required: ['content', 'authorId']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Post created successfully',
    schema: {
      example: {
        _id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        content: 'What\'s your favorite programming language? Vote now! #coding',
        authorId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        media: ['https://res.cloudinary.com/example/image1.jpg'],
        hashtags: ['coding', 'poll'],
        poll_id: 'poll123',
        likes: [],
        retweets: [],
        bookmarks: [],
        replies: [],
        views: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    }
  })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Handle media uploads if files are provided
    let mediaUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await this.cloudinaryService.uploadMedia(file);
        mediaUrls.push(result.url);
      }
    }

    // Parse poll data from form data if it exists
    let pollData = null;
    if (createPostDto['poll[question]']) {
      pollData = {
        question: createPostDto['poll[question]'],
        options: Array.isArray(createPostDto['poll[options][]']) 
          ? createPostDto['poll[options][]'] 
          : [createPostDto['poll[options][]']],
        expiresAt: createPostDto['poll[expiresAt]'],
        userId: createPostDto['poll[userId]']
      };
    }

    // Merge uploaded media URLs with any pre-existing URLs from DTO
    const finalMediaUrls = [...(createPostDto.media || []), ...mediaUrls];

    // Create post with all data
    return this.postsService.create({
      ...createPostDto,
      media: finalMediaUrls,
      poll: pollData,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of posts per page', type: Number, example: 10 })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filter by author ID', example: 'user123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Posts retrieved successfully',
    schema: {
              example: {
          posts: [
            {
              _id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
              content: 'Test Post',
              authorId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
              media: [],
              hashtags: ['coding', 'programming'],
              mentions: [],
              likes: [],
              retweets: [],
              bookmarks: [],
              replies: [],
              views: 0,
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          total: 1,
          page: 1,
          limit: 10
        }
    }
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('authorId') authorId?: string,
  ) {
    return this.postsService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      authorId,
    });
  }





  @Get(':id')
  @ApiOperation({ summary: 'Get a specific post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post retrieved successfully',
    schema: {
      example: {
        _id: 'post1',
        content: 'Test Post #code #programming',
        authorId: 'user1',
        media: [],
        hashtags: ['coding', 'programming'],
        mentions: [],
        likes: [],
        retweets: [],
        bookmarks: [],
        replies: [],
        views: 0,
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiBody({ 
    schema: {
      example: {
        userId: 'user1'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Post liked successfully' })
  async likePost(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.likePost(id, userId);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiBody({ 
    schema: {
      example: {
        userId: 'user1'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  async unlikePost(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.unlikePost(id, userId);
  }

  @Post(':id/retweet')
  @ApiOperation({ summary: 'Retweet a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiBody({ 
    schema: {
      example: {
        userId: 'user1'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Post retweeted successfully' })
  async retweetPost(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.retweetPost(id, userId);
  }

  @Delete(':id/retweet')
  @ApiOperation({ summary: 'Remove retweet' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiBody({ 
    schema: {
      example: {
        userId: 'user1'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Retweet removed successfully' })
  async unretweetPost(@Param('id') id: string, @Body('userId') userId: string) {
    return this.postsService.unretweetPost(id, userId);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies to a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiResponse({ 
    status: 200, 
    description: 'Replies retrieved successfully',
    schema: {
      example: {
        replies: [
          {
            _id: 'reply123',
            content: 'Great post!',
            authorId: 'user4',
            reply_to: 'post1',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ]
      }
    }
  })
  async getReplies(@Param('id') id: string) {
    return this.postsService.getReplies(id, { page: 1, limit: 10 });
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'post1' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Reply created successfully' })
  async replyToPost(@Param('id') id: string, @Body() createPostDto: CreatePostDto) {
    return this.postsService.replyToPost(id, createPostDto);
  }

  @Get('search/content')
  @ApiOperation({ summary: 'Search posts by content, hashtags, or mentions' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true, example: 'programming' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Number of posts per page', required: false, type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    schema: {
      example: {
        posts: [
          {
            _id: 'post1',
            content: 'This is my first post! #coding #programming',
            authorId: 'user1',
            hashtags: ['coding', 'programming'],
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      }
    }
  })
  async searchPosts(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.postsService.searchPosts(query, { page: parseInt(page), limit: parseInt(limit) });
  }

  @Get('trending/hashtags')
  @ApiOperation({ summary: 'Get trending hashtags' })
  @ApiQuery({ name: 'limit', description: 'Number of trending hashtags to return', required: false, type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Trending hashtags retrieved successfully',
    schema: {
      example: {
        hashtags: [
          {
            hashtag: 'programming',
            count: 150,
            posts: 45
          },
          {
            hashtag: 'coding',
            count: 120,
            posts: 38
          }
        ]
      }
    }
  })
  async getTrendingHashtags(
    @Query('limit') limit: string = '10',
  ) {
    return this.postsService.getTrendingHashtags(parseInt(limit));
  }

  @Get('test/redis')
  @ApiOperation({ summary: 'Test Redis cache functionality' })
  @ApiResponse({ 
    status: 200, 
    description: 'Redis cache test results',
    schema: {
      example: {
        status: 'healthy',
        message: 'Cache is working properly',
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
  })
  async testRedis() {
    return this.postsService.testRedisCache();
  }

  @Get('test/db-indexes')
  @ApiOperation({ summary: 'Test database indexes service' })
  async testDatabaseIndexes() {
    try {
      const postgresIndexes = await this.databaseIndexesService.getPostgresIndexes();
      return {
        message: 'Database indexes service is working',
        postgresIndexes: postgresIndexes.total,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Database indexes service error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get user timeline with posts from followed users' })
  @ApiQuery({ name: 'userId', description: 'User ID', required: true, example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Number of posts per page', required: false, type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Timeline retrieved successfully',
    schema: {
      example: {
        posts: [
          {
            _id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            content: 'This is a timeline post!',
            authorId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
            hashtags: ['timeline', 'post'],
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      }
    }
  })
  async getTimeline(
    @Query('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.postsService.getTimeline(userId, { page: parseInt(page), limit: parseInt(limit) });
  }
}
