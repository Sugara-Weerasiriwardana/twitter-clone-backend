import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';

@Injectable()
export class PollsService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {
    // Test MongoDB connection on service initialization
    this.testMongoConnection();
  }

  private async testMongoConnection() {
    try {
      // Try to perform a simple operation to test connection
      const count = await this.postModel.countDocuments();
      console.log('✅ MongoDB connection successful. Posts count:', count);
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
    }
  }

  async createPoll(createPollDto: CreatePollDto) {
    const { question, options, expiresAt, userId, postContent, hashtags } = createPollDto;

    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create a post automatically for the poll
      const defaultPostContent = postContent || `Poll: ${question}`;
      const defaultHashtags = hashtags || ['poll'];
      
      const post = new this.postModel({
        content: defaultPostContent,
        authorId: userId,
        hashtags: defaultHashtags,
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

      // Create poll with the post ID
      const poll = await this.prisma.poll.create({
        data: {
          question,
          options: options,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          userId,
          postId: savedPost._id.toString(),
        },
        include: {
          votes: true,
          user: true,
        },
      });

      // Update the post with the poll ID
      savedPost.poll_id = poll.id;
      await savedPost.save();

      // Ensure postId is properly returned in the response
      const pollResponse = {
        ...poll,
        postId: savedPost._id.toString(),
      };
      
      return pollResponse;
    } catch (error) {
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        throw new BadRequestException(`Database error: ${error.message}`);
      }
      throw error;
    }
  }

  async votePoll(pollId: string, votePollDto: VotePollDto) {
    const { userId, optionIndex } = votePollDto;

    // Check if poll exists and is not expired
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { votes: true },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.expiresAt && poll.expiresAt < new Date()) {
      throw new BadRequestException('Poll has expired');
    }

    // Check if option index is valid
    const options = poll.options as string[];
    if (optionIndex >= options.length) {
      throw new BadRequestException('Invalid option index');
    }

    // Check if user has already voted
    const existingVote = await this.prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId,
        },
      },
    });

    if (existingVote) {
      throw new BadRequestException('User has already voted on this poll');
    }

    // Create vote
    const vote = await this.prisma.pollVote.create({
      data: {
        pollId,
        userId,
        optionIndex,
      },
      include: {
        poll: true,
        user: true,
      },
    });

    return vote;
  }

  async getPollResults(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        votes: true,
        user: true,
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    const options = poll.options as string[];
    const results = options.map((option, index) => {
      const votesForOption = poll.votes.filter(
        (vote) => vote.optionIndex === index,
      ).length;
      const percentage = (votesForOption / poll.votes.length) * 100 || 0;

      return {
        option,
        votes: votesForOption,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    return {
      id: poll.id,
      question: poll.question,
      totalVotes: poll.votes.length,
      results,
      expiresAt: poll.expiresAt,
      isExpired: poll.expiresAt ? poll.expiresAt < new Date() : false,
      createdAt: poll.createdAt,
      user: poll.user,
    };
  }

  async getActivePolls(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [polls, total] = await Promise.all([
      this.prisma.poll.findMany({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          votes: true,
          user: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.poll.count({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      }),
    ]);

    return {
      polls: polls.map(poll => ({
        ...poll,
        totalVotes: poll.votes.length,
      })),
      total,
      page,
      limit,
    };
  }
}