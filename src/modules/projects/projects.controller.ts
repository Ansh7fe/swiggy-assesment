import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/project.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project with key and standard workflow seed' })
  @ApiResponse({ status: 201, description: 'Project successfully initialized with workflow.' })
  @ApiResponse({ status: 409, description: 'Project key already taken.' })
  create(@Body() dto: CreateProjectDto, @CurrentUser('id') userId: string) {
    return this.projectsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  @ApiResponse({ status: 200, description: 'Projects list retrieved.' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':idOrKey')
  @ApiOperation({ summary: 'Retrieve project by Key or ID, including workflow structure' })
  @ApiResponse({ status: 200, description: 'Project details retrieved.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findOne(@Param('idOrKey') idOrKey: string) {
    return this.projectsService.findOne(idOrKey);
  }

  @Get(':idOrKey/board')
  @ApiOperation({ summary: 'Retrieve the project board columns and issues' })
  @ApiResponse({ status: 200, description: 'Board columns and issues retrieved.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getBoard(@Param('idOrKey') idOrKey: string) {
    return this.projectsService.getBoard(idOrKey);
  }
}
