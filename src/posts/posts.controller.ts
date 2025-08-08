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
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Post created successfully',
    schema: {
              example: {
          _id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          content: 'Advance Js project',
          authorId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          media: [],
          hashtags: ['coding', 'programming'],
          mentions: [],
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
  async create(
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(createPostDto);
  }

  @Post('with-poll')
  @ApiOperation({ summary: 'Create a new post with poll' })
  @ApiBody({ 
    schema: {
      example: {
        content: "What's your favorite programming language? Vote now! #coding",
        authorId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        hashtags: ["coding", "poll"],
        poll: {
          question: "What's your favorite programming language?",
          options: ["JavaScript", "Python", "Java", "TypeScript"],
          expiresAt: "2024-12-31T23:59:59Z",
          userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Post with poll created successfully',
    schema: {
      example: {
        _id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        content: "What's your favorite programming language? Vote now! #coding",
        authorId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        poll_id: 'poll123',
        hashtags: ['coding', 'poll'],
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  })
  async createWithPoll(
    @Body() createPostDto: CreatePostDto,
    @Body('poll') pollDto: any,
  ) {
    return this.postsService.create(createPostDto, pollDto);
  }

  @Post('with-media')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Create a post with media upload' })
  @ApiResponse({ status: 201, description: 'Post with media created successfully' })
  async createWithMedia(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const mediaUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await this.cloudinaryService.uploadMedia(file);
        mediaUrls.push(result.url);
      }
    }
    
    return this.postsService.create({
      ...createPostDto,
      media: mediaUrls,
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
}
