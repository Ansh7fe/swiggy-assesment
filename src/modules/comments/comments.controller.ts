import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('issues/:issueId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new flat comment to an issue' })
  @ApiResponse({ status: 201, description: 'Comment successfully added.' })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  create(
    @Param('issueId') issueId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.create(issueId, dto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list of flat comments for an issue, sorted newest first',
  })
  @ApiResponse({ status: 200, description: 'Comments retrieved.' })
  @ApiResponse({ status: 404, description: 'Issue not found.' })
  findIssueComments(@Param('issueId') issueId: string) {
    return this.commentsService.findIssueComments(issueId);
  }
}
