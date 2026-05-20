import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import {
  CreateIssueDto,
  UpdateIssueDto,
  TransitionIssueDto,
} from './dto/issue.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Issues')
@ApiBearerAuth()
@Controller()
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Post('projects/:projectId/issues')
  @ApiOperation({ summary: 'Create a new issue inside a project' })
  @ApiResponse({ status: 201, description: 'Issue successfully initialized.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateIssueDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.issuesService.create(projectId, dto, userId);
  }

  @Get('issues/:idOrKey')
  @ApiOperation({ summary: 'Retrieve an issue by ID or Key (e.g. PROJ-1)' })
  @ApiResponse({ status: 200, description: 'Issue retrieved.' })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  findOne(@Param('idOrKey') idOrKey: string) {
    return this.issuesService.findOne(idOrKey);
  }

  @Patch('issues/:idOrKey')
  @ApiOperation({
    summary: 'Update an issue (supports optimistic locking via version field)',
  })
  @ApiResponse({ status: 200, description: 'Issue updated.' })
  @ApiResponse({
    status: 409,
    description: 'Optimistic locking concurrency conflict.',
  })
  @ApiResponse({ status: 422, description: 'Workflow validation failed.' })
  update(
    @Param('idOrKey') idOrKey: string,
    @Body() dto: UpdateIssueDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.issuesService.update(idOrKey, dto, userId);
  }

  @Post('issues/:idOrKey/transitions')
  @ApiOperation({
    summary:
      'Transition an issue status (validates state machine, supports optimistic locking)',
  })
  @ApiResponse({ status: 200, description: 'Issue status updated.' })
  @ApiResponse({
    status: 409,
    description: 'Optimistic locking concurrency conflict.',
  })
  @ApiResponse({ status: 422, description: 'Workflow transition not allowed.' })
  transition(
    @Param('idOrKey') idOrKey: string,
    @Body() dto: TransitionIssueDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.issuesService.transition(idOrKey, dto, userId);
  }
}
