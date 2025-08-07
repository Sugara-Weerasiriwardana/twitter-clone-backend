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
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Post('with-media')
  @UseInterceptors(FilesInterceptor('files', 4)) // Max 4 files
  async createWithMedia(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let mediaUrls: string[] = [];
    
    if (files && files.length > 0) {
      try {
        console.log(`Uploading ${files.length} files to Cloudinary...`);
        const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files);
        mediaUrls = uploadResults.map(result => result.url);
        console.log('Uploaded URLs:', mediaUrls);
      } catch (error) {
        console.error('File upload failed:', error);
        throw new Error(`File upload failed: ${error.message}`);
      }
    }

    return this.postsService.create({
      ...createPostDto,
      media: mediaUrls,
    });
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('authorId') authorId?: string,
    @Query('hashtag') hashtag?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    return this.postsService.findAll({
      page: pageNum,
      limit: limitNum,
      authorId,
      hashtag,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/like')
  async likePost(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.postsService.likePost(id, userId);
  }

  @Delete(':id/like')
  async unlikePost(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.postsService.unlikePost(id, userId);
  }

  @Post(':id/retweet')
  async retweetPost(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.postsService.retweetPost(id, userId);
  }

  @Delete(':id/retweet')
  async unretweetPost(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.postsService.unretweetPost(id, userId);
  }

  @Get(':id/replies')
  async getReplies(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    return this.postsService.getReplies(id, {
      page: pageNum,
      limit: limitNum,
    });
  }

  @Post(':id/reply')
  async replyToPost(
    @Param('id') id: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.replyToPost(id, createPostDto);
  }

  @Get('search/content')
  async searchPosts(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    return this.postsService.searchPosts(query, {
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('trending/hashtags')
  async getTrendingHashtags(
    @Query('limit') limit: string = '10',
  ) {
    const limitNum = parseInt(limit, 10);
    return this.postsService.getTrendingHashtags(limitNum);
  }
}
