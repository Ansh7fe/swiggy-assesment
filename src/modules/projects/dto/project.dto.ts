import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'PROJ',
    description:
      'Unique project identifier key (uppercase alphanumeric, 2-10 chars)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Project key must be uppercase alphanumeric',
  })
  key!: string;

  @ApiProperty({ example: 'Core Swiggy Platform', description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'Sprints and workflows for central food delivery services',
    description: 'Project description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
