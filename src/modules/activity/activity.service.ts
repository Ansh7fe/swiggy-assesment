import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

interface IssueEventPayload {
  issue: any;
  oldValue?: any;
  newValue?: any;
  actorId: string;
}

interface CommentEventPayload {
  comment: any;
  issue: any;
  actorId: string;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Listen to issue creation event and record it.
   */
  @OnEvent('issue.created')
  async handleIssueCreated(payload: IssueEventPayload) {
    try {
      await this.prisma.activityLog.create({
        data: {
          projectId: payload.issue.projectId,
          issueId: payload.issue.id,
          actorId: payload.actorId,
          action: 'ISSUE_CREATED',
          metadata: {
            title: payload.issue.title,
            type: payload.issue.type,
            status: payload.issue.status,
            priority: payload.issue.priority,
            assigneeId: payload.issue.assigneeId,
          },
        },
      });
      this.logger.log(`Logged ISSUE_CREATED for issue ${payload.issue.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to log issue creation activity: ${error.message}`);
    }
  }

  /**
   * Listen to issue update event and record it.
   */
  @OnEvent('issue.updated')
  async handleIssueUpdated(payload: IssueEventPayload) {
    try {
      const isStatusChange = payload.oldValue?.status !== payload.newValue?.status;
      const action = isStatusChange ? 'ISSUE_STATUS_CHANGED' : 'ISSUE_UPDATED';

      await this.prisma.activityLog.create({
        data: {
          projectId: payload.issue.projectId,
          issueId: payload.issue.id,
          actorId: payload.actorId,
          action,
          metadata: {
            oldValue: payload.oldValue,
            newValue: payload.newValue,
          },
        },
      });
      this.logger.log(`Logged ${action} for issue ${payload.issue.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to log issue update activity: ${error.message}`);
    }
  }

  /**
   * Listen to comment addition event and record it.
   */
  @OnEvent('comment.added')
  async handleCommentAdded(payload: CommentEventPayload) {
    try {
      await this.prisma.activityLog.create({
        data: {
          projectId: payload.issue.projectId,
          issueId: payload.issue.id,
          actorId: payload.actorId,
          action: 'COMMENT_ADDED',
          metadata: {
            commentId: payload.comment.id,
            contentPreview: payload.comment.content.substring(0, 100),
          },
        },
      });
      this.logger.log(`Logged COMMENT_ADDED for issue ${payload.issue.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to log comment addition activity: ${error.message}`);
    }
  }

  /**
   * Fetch activity logs for a specific project.
   */
  async findProjectActivity(projectId: string, limit = 50, cursor?: string) {
    return this.prisma.activityLog.findMany({
      where: { projectId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        issue: {
          select: {
            id: true,
            issueNumber: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
