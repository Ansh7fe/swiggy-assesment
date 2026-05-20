import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SprintsService } from './sprints.service';
import {
  CreateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from './dto/sprint.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sprints')
@ApiBearerAuth()
@Controller()
export class SprintsController {
  constructor(private sprintsService: SprintsService) {}

  @Post('projects/:projectId/sprints')
  @ApiOperation({ summary: 'Create a new sprint in PLANNING stage' })
  @ApiResponse({ status: 201, description: 'Sprint successfully initialized.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  create(@Param('projectId') projectId: string, @Body() dto: CreateSprintDto) {
    return this.sprintsService.create(projectId, dto);
  }

  @Post('sprints/:id/start')
  @ApiOperation({
    summary:
      'Activate a planning sprint (asserts no other active sprints exist)',
  })
  @ApiResponse({ status: 200, description: 'Sprint started successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Another sprint is already active.',
  })
  start(
    @Param('id') id: string,
    @Body() dto: StartSprintDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.sprintsService.start(id, dto, userId);
  }

  @Post('sprints/:id/complete')
  @ApiOperation({
    summary:
      'Complete an active sprint, calculating velocity and managing carry-overs',
  })
  @ApiResponse({
    status: 200,
    description: 'Sprint completed. Velocity calculated.',
  })
  @ApiResponse({ status: 400, description: 'Sprint is not currently active.' })
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteSprintDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.sprintsService.complete(id, dto, userId);
  }

  @Get('projects/:projectId/sprints')
  @ApiOperation({ summary: 'Get list of all sprints in a project' })
  @ApiResponse({ status: 200, description: 'Sprints list retrieved.' })
  findProjectSprints(@Param('projectId') projectId: string) {
    return this.sprintsService.findProjectSprints(projectId);
  }
}
