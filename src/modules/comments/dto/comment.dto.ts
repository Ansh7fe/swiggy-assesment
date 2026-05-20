import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example:
      'I have started implementing the database migrations for the FTS indexes.',
    description: 'Comment body content',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  content!: string;
}
