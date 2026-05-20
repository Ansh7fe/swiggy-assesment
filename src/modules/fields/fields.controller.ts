import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FieldsService } from './fields.service';
import { CreateCustomFieldDto, SetCustomFieldValueDto } from './dto/fields.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Custom Fields & Watchers')
@ApiBearerAuth()
@Controller()
export class FieldsController {
  constructor(private fieldsService: FieldsService) {}

  @Post('projects/:projectId/custom-fields')
  @ApiOperation({
    summary: 'Define a custom field (TEXT or DROPDOWN) for a project',
  })
  @ApiResponse({
    status: 201,
    description: 'Custom field registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors (e.g. missing dropdown options).',
  })
  createCustomField(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCustomFieldDto,
  ) {
    return this.fieldsService.createCustomField(projectId, dto);
  }

  @Post('issues/:issueId/custom-fields')
  @ApiOperation({ summary: 'Record/update custom field value on an issue' })
  @ApiResponse({
    status: 201,
    description: 'Field value successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation errors (e.g. value not in dropdown config).',
  })
  setCustomFieldValue(
    @Param('issueId') issueId: string,
    @Body() dto: SetCustomFieldValueDto,
  ) {
    return this.fieldsService.setCustomFieldValue(issueId, dto);
  }

  @Post('issues/:issueId/watch')
  @ApiOperation({ summary: 'Subscribe to watch an issue' })
  @ApiResponse({ status: 201, description: 'Subscribed as watcher.' })
  addWatcher(
    @Param('issueId') issueId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.fieldsService.addWatcher(issueId, userId);
  }

  @Delete('issues/:issueId/watch')
  @ApiOperation({ summary: 'Unsubscribe from watching an issue' })
  @ApiResponse({ status: 200, description: 'Watcher removed.' })
  removeWatcher(
    @Param('issueId') issueId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.fieldsService.removeWatcher(issueId, userId);
  }
}
