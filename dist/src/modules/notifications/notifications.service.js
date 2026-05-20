"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleIssueUpdatedNotification(payload) {
        try {
            const { issue, oldValue, newValue, actorId } = payload;
            if (newValue.assigneeId && oldValue.assigneeId !== newValue.assigneeId && newValue.assigneeId !== actorId) {
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
                this.logger.log(`Created assignment notification for user ${newValue.assigneeId}`);
            }
            if (oldValue.status !== newValue.status) {
                const watchers = await this.prisma.watcher.findMany({
                    where: {
                        issueId: issue.id,
                        userId: { not: actorId },
                    },
                });
                if (watchers.length > 0) {
                    await Promise.all(watchers.map((watcher) => this.prisma.notification.create({
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
                    })));
                    this.logger.log(`Created status change notifications for ${watchers.length} watchers.`);
                }
            }
        }
        catch (err) {
            this.logger.error(`Failed to generate notifications for issue update: ${err.message}`);
        }
    }
    async handleCommentAddedNotification(payload) {
        try {
            const { comment, issue, actorId } = payload;
            const watchers = await this.prisma.watcher.findMany({
                where: {
                    issueId: issue.id,
                    userId: { not: actorId },
                },
            });
            if (watchers.length > 0) {
                await Promise.all(watchers.map((watcher) => this.prisma.notification.create({
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
                })));
                this.logger.log(`Created comment notifications for ${watchers.length} watchers.`);
            }
        }
        catch (err) {
            this.logger.error(`Failed to generate notifications for comment addition: ${err.message}`);
        }
    }
    async getUserNotifications(userId, isRead) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                isRead: isRead !== undefined ? isRead : undefined,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification "${notificationId}" was not found.`);
        }
        if (notification.userId !== userId) {
            throw new common_1.NotFoundException('You do not have permission to modify this notification.');
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, event_emitter_1.OnEvent)('issue.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "handleIssueUpdatedNotification", null);
__decorate([
    (0, event_emitter_1.OnEvent)('comment.added'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "handleCommentAddedNotification", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map