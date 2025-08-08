import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePollDto } from './dto/create-poll.dto';
import { VotePollDto } from './dto/vote-poll.dto';
import { PollsService } from './polls.service';

@ApiTags('polls')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new poll' })
  @ApiBody({ type: CreatePollDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Poll created successfully',
    schema: {
              example: {
          id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          question: 'choose favourite programming language?',
          options: ['JavaScript', 'Python', 'Java', 'TypeScript'],
          expiresAt: '2024-12-31T23:59:59Z',
          userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          postId: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
          createdAt: '2024-01-01T00:00:00Z'
        }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPoll(@Body() createPollDto: CreatePollDto) {
    return this.pollsService.createPoll(createPollDto);
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Vote on a poll' })
  @ApiParam({ name: 'id', description: 'Poll ID', example: 'poll123' })
  @ApiBody({ type: VotePollDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Vote recorded successfully',
    schema: {
              example: {
          id: 'c3d4e5f6-g7h8-9012-3456-789012bcdefg',
          pollId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          optionIndex: 0,
          createdAt: '2024-01-01T00:00:00Z'
        }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid vote or poll expired' })
  @ApiResponse({ status: 404, description: 'Poll not found' })
  async votePoll(
    @Param('id') id: string,
    @Body() votePollDto: VotePollDto,
  ) {
    return this.pollsService.votePoll(id, votePollDto);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get poll results' })
  @ApiParam({ name: 'id', description: 'Poll ID', example: 'poll123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Poll results retrieved successfully',
    schema: {
              example: {
          pollId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          question: 'choose favourite programming language?',
          options: ['JavaScript', 'Python', 'Java', 'TypeScript'],
          results: [
            { option: 'JavaScript', votes: 15, percentage: 37.5 },
            { option: 'Python', votes: 12, percentage: 30 },
            { option: 'Java', votes: 8, percentage: 20 },
            { option: 'TypeScript', votes: 5, percentage: 12.5 }
          ],
          totalVotes: 40,
          isExpired: false
        }
    }
  })
  @ApiResponse({ status: 404, description: 'Poll not found' })
  async getPollResults(@Param('id') id: string) {
    return this.pollsService.getPollResults(id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active polls' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of polls per page', type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Active polls retrieved successfully',
    schema: {
              example: {
          polls: [
            {
              id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
              question: 'What is your favorite programming language?',
              options: ['JavaScript', 'Python', 'Java', 'TypeScript'],
              expiresAt: '2024-12-31T23:59:59Z',
              userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          total: 1,
          page: 1,
          limit: 10
        }
    }
  })
  async getActivePolls(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.pollsService.getActivePolls(page, limit);
  }
}