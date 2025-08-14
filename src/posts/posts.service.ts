import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { Post, PostDocument } from './schemas/post.schema';

interface PollData {
  question: string;
  options: string[];
  expiresAt?: string;
  userId: string;
}

interface FindAllOptions {
  page: number;
  limit: number;
  authorId?: string;
  hashtag?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async create(createPostDto: CreatePostDto & { poll?: PollData }): Promise<Post> {
    const { poll, ...postData } = createPostDto;
    
    const post = new this.postModel({
      ...postData,
      poll_id: null,
      likes: [],
      retweets: [],
      bookmarks: [],
      replies: [],
      isRetweet: false,
      isEdited: false,
      visibility: 'public',
      isPinned: false,
      views: 0,
      reportedBy: [],
      isDeleted: false,
    });

    const savedPost = await post.save();

    if (poll) {
      try {
        // First, ensure the user exists in PostgreSQL
        const existingUser = await this.prisma.user.findUnique({
          where: { id: poll.userId }
        });

        if (!existingUser) {
          // Create a basic user if it doesn't exist
          await this.prisma.user.create({
            data: {
              id: poll.userId,
              keycloakId: poll.userId, // Using userId as keycloakId for simplicity
              username: `user_${poll.userId}`,
              email: `${poll.userId}@example.com`,
              displayName: `User ${poll.userId}`,
            }
          });
        }

        const pollRecord = await this.prisma.poll.create({
          data: {
            question: poll.question,
            options: poll.options,
            expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
            userId: poll.userId,
            postId: savedPost._id.toString(),
          },
        });
        
        savedPost.poll_id = pollRecord.id;
        await savedPost.save();
      } catch (error) {
        console.error('Error creating poll:', error);
        // Continue without poll if there's an error
      }
    }

    return savedPost;
  }

  async findAll(options: FindAllOptions): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const { page, limit, authorId, hashtag } = options;
    const skip = (page - 1) * limit;

    let query: any = { isDeleted: false };

    if (authorId) {
      query.authorId = authorId;
    }

    if (hashtag) {
      query.hashtags = { $in: [hashtag] };
    }

    const [posts, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(query).exec(),
    ]);

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        ...updatePostDto,
        isEdited: true,
        updatedAt: new Date(),
      },
      { new: true }
    ).exec();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found or has been deleted`);
    }
    return post;
  }

  async remove(id: string): Promise<{ message: string }> {
    const post = await this.postModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).exec();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return { message: 'Post deleted successfully' };
  }

  async likePost(id: string, userId: string): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found or has been deleted`);
    }

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    return post;
  }

  async unlikePost(id: string, userId: string): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found or has been deleted`);
    }

    post.likes = post.likes.filter(likeId => likeId !== userId);
    await post.save();

    return post;
  }

  async retweetPost(id: string, userId: string): Promise<Post> {
    const originalPost = await this.postModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!originalPost) {
      throw new NotFoundException(`Post with ID ${id} not found or has been deleted`);
    }
//  check if user already retweeted
    if (originalPost.retweets.includes(userId)) {
      throw new Error('User has already retweeted this post');
    }

//   create retweet post function
    const retweet = new this.postModel({
      content: originalPost.content,
      media: originalPost.media,
      hashtags: originalPost.hashtags,
      mentions: originalPost.mentions,
      authorId: userId,
      isRetweet: true,
      originalPostId: id,
      likes: [],
      retweets: [],
      bookmarks: [],
      replies: [],
      isEdited: false,
      visibility: 'public',
      isPinned: false,
      views: 0,
      reportedBy: [],
      isDeleted: false,
    });

    await retweet.save();

//  update original post retweets count function
    originalPost.retweets.push(userId);
    await originalPost.save();

    return retweet;
  }

  async unretweetPost(id: string, userId: string): Promise<{ message: string }> {
    const originalPost = await this.postModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!originalPost) {
      throw new NotFoundException(`Post with ID ${id} not found or has been deleted`);
    }

//  delete original retweet post funtion
    originalPost.retweets = originalPost.retweets.filter(retweetId => retweetId !== userId);
    await originalPost.save();

//    Delete funtion for retweet post
    await this.postModel.findOneAndDelete({
      originalPostId: id,
      authorId: userId,
      isRetweet: true,
    });

    return { message: 'Retweet removed successfully' };
  }

  async getReplies(id: string, options: PaginationOptions): Promise<{ replies: Post[]; total: number; page: number; limit: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      this.postModel
        .find({ parentPostId: id, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments({ parentPostId: id, isDeleted: false }).exec(),
    ]);

    return {
      replies,
      total,
      page,
      limit,
    };
  }

  async replyToPost(id: string, createPostDto: CreatePostDto): Promise<Post> {
    const parentPost = await this.postModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!parentPost) {
      throw new NotFoundException(`Parent post with ID ${id} not found or has been deleted`);
    }

    const reply = new this.postModel({
      ...createPostDto,
      parentPostId: id,
      likes: [],
      retweets: [],
      bookmarks: [],
      replies: [],
      isRetweet: false,
      isEdited: false,
      visibility: 'public',
      isPinned: false,
      views: 0,
      reportedBy: [],
      isDeleted: false,
    });

    const savedReply = await reply.save();

    // Update parent post replies count
    parentPost.replies.push(savedReply._id.toString());
    await parentPost.save();

    return savedReply;
  }

  async searchPosts(query: string, options: PaginationOptions): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    // Try to get cached results first
    const cacheKey = `search:${query}:${page}:${limit}`;
    const cachedResults = await this.redisService.getSearchResults(cacheKey);
    
    if (cachedResults) {
      return cachedResults as { posts: Post[]; total: number; page: number; limit: number };
    }

    const searchQuery = {
      $and: [
        { isDeleted: false },
        {
          $or: [
            { content: { $regex: query, $options: 'i' } },
            { hashtags: { $in: [new RegExp(query, 'i')] } },
            { mentions: { $in: [new RegExp(query, 'i')] } },
          ],
        },
      ],
    };

    const [posts, total] = await Promise.all([
      this.postModel
        .find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(searchQuery).exec(),
    ]);

    const results = {
      posts,
      total,
      page,
      limit,
    };

    // Cache the results
    await this.redisService.cacheSearchResults(cacheKey, results, 300);

    return results;
  }

  async getTrendingHashtags(limit: number): Promise<{ hashtag: string; count: number }[]> {
    const result = await this.postModel.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          hashtag: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  async testRedisCache() {
    return this.redisService.getCacheStats();
  }

  async getTimeline(userId: string, options: PaginationOptions): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    // Try to get cached timeline first
    const cacheKey = `timeline:${userId}:${page}:${limit}`;
    const cachedTimeline = await this.redisService.getFeed(cacheKey);
    
    if (cachedTimeline) {
      return cachedTimeline as { posts: Post[]; total: number; page: number; limit: number };
    }

    // Get user's following list from PostgreSQL
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);

    // Add user's own posts to timeline
    followingIds.push(userId);

    // Get posts from followed users and user's own posts
    const [posts, total] = await Promise.all([
      this.postModel
        .find({
          authorId: { $in: followingIds },
          isDeleted: false
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments({
        authorId: { $in: followingIds },
        isDeleted: false
      }).exec(),
    ]);

    const timeline = {
      posts,
      total,
      page,
      limit,
    };

    // Cache the timeline for 5 minutes
    await this.redisService.cacheFeed(cacheKey, timeline, 300);

    return timeline;
  }
}
