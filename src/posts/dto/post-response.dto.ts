import { IsArray, IsDate, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class PostResponseDto {
  @IsString()
  id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  media?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @IsOptional()
  @IsString()
  pollId?: string;

  @IsString()
  authorId: string;

  @IsNumber()
  likesCount: number;

  @IsNumber()
  retweetsCount: number;

  @IsNumber()
  commentsCount: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
} 