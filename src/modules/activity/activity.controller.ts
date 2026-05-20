import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivityService } from './activity.service';

@ApiTags('Activity')
@ApiBearerAuth()
@Controller('projects/:projectId/activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs and activity history for a project' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of logs to fetch (default: 50)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor ID for pagination' })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved successfully.' })
  findProjectActivity(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.activityService.findProjectActivity(projectId, parsedLimit, cursor);
  }
}
