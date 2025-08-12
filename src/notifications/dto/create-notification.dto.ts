import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: '9137b7a8-f3a8-4eba-a814-68110c4a15d8' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'COMMENT' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Alice commented on your post.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: { postId: '64d1...', commentId: '64d2...' } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}
