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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let CommentsService = class CommentsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(issueId, dto, userId) {
        const issue = await this.prisma.issue.findUnique({
            where: { id: issueId },
        });
        if (!issue) {
            throw new common_1.NotFoundException(`Issue with ID "${issueId}" does not exist.`);
        }
        const comment = await this.prisma.comment.create({
            data: {
                issueId,
                userId,
                content: dto.content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                    },
                },
            },
        });
        this.eventEmitter.emit('comment.added', {
            comment,
            issue,
            actorId: userId,
        });
        return comment;
    }
    async findIssueComments(issueId) {
        const issue = await this.prisma.issue.findUnique({
            where: { id: issueId },
        });
        if (!issue) {
            throw new common_1.NotFoundException(`Issue with ID "${issueId}" does not exist.`);
        }
        return this.prisma.comment.findMany({
            where: { issueId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], CommentsService);
//# sourceMappingURL=comments.service.js.map