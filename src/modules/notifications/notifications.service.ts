import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('issue.updated')
  async handleIssueUpdatedNotification(payload: {
    issue: any;
    oldValue: any;
    newValue: any;
    actorId: string;
  }) {
    try {
      const { issue, oldValue, newValue, actorId } = payload;

      if (
        newValue.assigneeId &&
        oldValue.assigneeId !== newValue.assigneeId &&
        newValue.assigneeId !== actorId
      ) {
        await this.prisma.notification.create({
          data: {
            userId: newValue.assigneeId,
            type: 'ISSUE_ASSIGNED',
            payload: {
              issueId: issue.id,
              issueKey: issue.key,
              title: issue.title,
              assignedBy: actorId,
            },
          },
        });
        this.logger.log(
          `Created assignment notification for user ${newValue.assigneeId}`,
        );
      }

      if (oldValue.status !== newValue.status) {
        const watchers = await this.prisma.watcher.findMany({
          where: {
            issueId: issue.id,
            userId: { not: actorId },
          },
        });

        if (watchers.length > 0) {
          await Promise.all(
            watchers.map((watcher) =>
              this.prisma.notification.create({
                data: {
                  userId: watcher.userId,
                  type: 'ISSUE_STATUS_CHANGED',
                  payload: {
                    issueId: issue.id,
                    issueKey: issue.key,
                    title: issue.title,
                    oldStatus: oldValue.status,
                    newStatus: newValue.status,
                    actorId,
                  },
                },
              }),
            ),
          );
          this.logger.log(
            `Created status change notifications for ${watchers.length} watchers.`,
          );
        }
      }
    } catch (err: any) {
      this.logger.error(
        `Failed to generate notifications for issue update: ${err.message}`,
      );
    }
  }

  @OnEvent('comment.added')
  async handleCommentAddedNotification(payload: {
    comment: any;
    issue: any;
    actorId: string;
  }) {
    try {
      const { comment, issue, actorId } = payload;

      const watchers = await this.prisma.watcher.findMany({
        where: {
          issueId: issue.id,
          userId: { not: actorId },
        },
      });

      if (watchers.length > 0) {
        await Promise.all(
          watchers.map((watcher) =>
            this.prisma.notification.create({
              data: {
                userId: watcher.userId,
                type: 'COMMENT_ADDED',
                payload: {
                  issueId: issue.id,
                  commentId: comment.id,
                  authorName: comment.user?.displayName || 'Someone',
                  contentPreview: comment.content.substring(0, 100),
                },
              },
            }),
          ),
        );
        this.logger.log(
          `Created comment notifications for ${watchers.length} watchers.`,
        );
      }
    } catch (err: any) {
      this.logger.error(
        `Failed to generate notifications for comment addition: ${err.message}`,
      );
    }
  }

  async getUserNotifications(userId: string, isRead?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: isRead !== undefined ? isRead : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification "${notificationId}" was not found.`,
      );
    }

    if (notification.userId !== userId) {
      throw new NotFoundException(
        'You do not have permission to modify this notification.',
      );
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
