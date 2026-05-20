import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateSprintDto {
  @ApiProperty({ example: 'Sprint 1 - Core Services', description: 'Sprint title' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Setup login auth and core issue flows', description: 'Sprint goal text', required: false })
  @IsString()
  @IsOptional()
  goal?: string;
}

export class StartSprintDto {
  @ApiProperty({ example: '2026-05-20T12:00:00.000Z', description: 'Sprint start date' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2026-06-03T12:00:00.000Z', description: 'Sprint target end date' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;
}

export class CompleteSprintDto {
  @ApiProperty({ example: 'uuid-next-sprint-id', description: 'Sprint ID to carry incomplete issues over to', required: false })
  @IsString()
  @IsOptional()
  carryOverSprintId?: string;

  @ApiProperty({ example: ['uuid-issue-1', 'uuid-issue-2'], description: 'List of specific issues to carry over (if omitted, all incomplete issues are carried over or backlogged)', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  carryOverIssueIds?: string[];
}
