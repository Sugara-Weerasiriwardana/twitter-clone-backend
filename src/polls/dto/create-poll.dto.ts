import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePollDto {
  @ApiProperty({ 
    description: 'The question of the poll', 
    example: 'What is your favorite programming language?' 
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ 
    description: 'Array of options for the poll', 
    example: ['JavaScript', 'Python', 'Java', 'TypeScript'] 
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ 
    description: 'Optional expiration date for the poll', 
    example: '2024-12-31T23:59:59Z', 
    required: false 
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ 
    description: 'ID of the user creating the poll (UUID format)', 
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' 
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'Optional custom post content for the poll', 
    example: 'Vote on your favorite programming language! #coding #poll', 
    required: false 
  })
  @IsOptional()
  @IsString()
  postContent?: string;

  @ApiProperty({ 
    description: 'Optional hashtags for the post', 
    example: ['coding', 'poll', 'programming'], 
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}