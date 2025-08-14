import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ 
    description: 'The content of the post', 
    example: 'This is my first post #flower #photo' 
  })
  @IsString()
  content: string;

  @ApiProperty({ 
    description: 'ID of the author (UUID format)', 
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' 
  })
  @IsString()
  authorId: string;

  @ApiProperty({ 
    description: 'Array of media URLs', 
    example: ['https://tinyurl.com/mve3bnnt', 'https://tinyurl.com/5ybrftdb'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  media?: string[];

  @ApiProperty({ 
    description: 'Array of hashtags', 
    example: ['coding', 'programming', 'javascript'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  hashtags?: string[];

  @ApiProperty({ 
    description: 'Array of user mentions', 
    example: ['@john', '@jane'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  mentions?: string[];


} 