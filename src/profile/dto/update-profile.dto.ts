import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Display name of the user', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ description: 'User bio', example: 'Full-stack developer', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: 'User preferences in JSON format',
    example: { theme: 'dark', language: 'en', notifications: true },
    required: false
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
