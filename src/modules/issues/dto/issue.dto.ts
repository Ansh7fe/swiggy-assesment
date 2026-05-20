import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsArray,
} from 'class-validator';
import { IssueType, IssuePriority } from '@prisma/client';

export class CreateIssueDto {
  @ApiProperty({ enum: IssueType, example: 'TASK', description: 'Issue type classification' })
  @IsEnum(IssueType)
  @IsNotEmpty()
  type!: IssueType;

  @ApiProperty({ example: 'Implement auth gateway', description: 'Issue title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Implement passport jwt strategy', description: 'Detailed description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: IssuePriority, example: 'MEDIUM', description: 'Issue priority scale' })
  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @ApiProperty({ example: 'uuid-user-id', description: 'Assignee user ID', required: false })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ example: 'uuid-sprint-id', description: 'Sprint ID', required: false })
  @IsString()
  @IsOptional()
  sprintId?: string;

  @ApiProperty({ example: 5, description: 'Story points estimate', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  storyPoints?: number;

  @ApiProperty({ example: 'uuid-parent-issue-id', description: 'Parent issue ID (for sub-tasks)', required: false })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ example: ['backend', 'security'], description: 'List of tags/labels', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];
}

export class UpdateIssueDto {
  @ApiProperty({ enum: IssueType, required: false })
  @IsEnum(IssueType)
  @IsOptional()
  type?: IssueType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: IssuePriority, required: false })
  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sprintId?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  storyPoints?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 1, description: 'Current issue version (mandatory for optimistic lock validation)' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  version!: number;

  @ApiProperty({ example: ['backend'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];
}

export class TransitionIssueDto {
  @ApiProperty({ example: 'IN_PROGRESS', description: 'Target workflow status name' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ example: 1, description: 'Current issue version (mandatory for optimistic lock validation)' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  version!: number;
}
