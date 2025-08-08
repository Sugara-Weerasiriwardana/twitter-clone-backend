import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class VotePollDto {
  @ApiProperty({ 
    description: 'ID of the user casting the vote (UUID format)', 
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' 
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: 'Index of the chosen option (0-based)', 
    example: 0 
  })
  @IsInt()
  @Min(0)
  optionIndex: number;
}