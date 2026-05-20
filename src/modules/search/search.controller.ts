import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text query search with structured filters and cursor pagination' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Text search query for title/description' })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by Project UUID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by Workflow status' })
  @ApiQuery({ name: 'assigneeId', required: false, type: String, description: 'Filter by Assignee UUID' })
  @ApiQuery({ name: 'priority', required: false, type: String, description: 'Filter by Priority level' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max records (default: 20)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'ISO date timestamp cursor of last retrieved issue' })
  @ApiResponse({ status: 200, description: 'Search matches retrieved successfully.' })
  search(
    @Query('q') q?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('priority') priority?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.searchService.searchIssues({
      q,
      projectId,
      status,
      assigneeId,
      priority,
      limit: parsedLimit,
      cursor,
    });
  }
}
