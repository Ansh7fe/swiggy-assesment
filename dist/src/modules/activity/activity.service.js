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
var ActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
let ActivityService = ActivityService_1 = class ActivityService {
    prisma;
    logger = new common_1.Logger(ActivityService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleIssueCreated(payload) {
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
        }
        catch (error) {
            this.logger.error(`Failed to log issue creation activity: ${error.message}`);
        }
    }
    async handleIssueUpdated(payload) {
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
        }
        catch (error) {
            this.logger.error(`Failed to log issue update activity: ${error.message}`);
        }
    }
    async handleCommentAdded(payload) {
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
        }
        catch (error) {
            this.logger.error(`Failed to log comment addition activity: ${error.message}`);
        }
    }
    async findProjectActivity(projectId, limit = 50, cursor) {
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
};
exports.ActivityService = ActivityService;
__decorate([
    (0, event_emitter_1.OnEvent)('issue.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityService.prototype, "handleIssueCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('issue.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityService.prototype, "handleIssueUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('comment.added'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityService.prototype, "handleCommentAdded", null);
exports.ActivityService = ActivityService = ActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map