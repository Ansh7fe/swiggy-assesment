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
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const projects_service_1 = require("../projects/projects.service");
const workflow_service_1 = require("../workflow/workflow.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let IssuesService = class IssuesService {
    prisma;
    projectsService;
    workflowService;
    eventEmitter;
    constructor(prisma, projectsService, workflowService, eventEmitter) {
        this.prisma = prisma;
        this.projectsService = projectsService;
        this.workflowService = workflowService;
        this.eventEmitter = eventEmitter;
    }
    async create(projectId, dto, reporterId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID "${projectId}" does not exist.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedProject = await tx.project.update({
                where: { id: projectId },
                data: { issueCounter: { increment: 1 } },
                select: { issueCounter: true },
            });
            const issueNumber = updatedProject.issueCounter;
            const issue = await tx.issue.create({
                data: {
                    projectId,
                    issueNumber,
                    type: dto.type,
                    title: dto.title,
                    description: dto.description,
                    status: 'TODO',
                    priority: dto.priority || 'MEDIUM',
                    assigneeId: dto.assigneeId || null,
                    sprintId: dto.sprintId || null,
                    parentId: dto.parentId || null,
                    storyPoints: dto.storyPoints || null,
                    reporterId,
                },
                include: {
                    project: true,
                    reporter: { select: { id: true, email: true, displayName: true } },
                    assignee: { select: { id: true, email: true, displayName: true } },
                },
            });
            if (dto.labels && dto.labels.length > 0) {
                await Promise.all(dto.labels.map((label) => tx.issueLabel.create({
                    data: {
                        issueId: issue.id,
                        label,
                    },
                })));
            }
            await tx.watcher.create({
                data: {
                    issueId: issue.id,
                    userId: reporterId,
                },
            });
            this.eventEmitter.emit('issue.created', {
                issue,
                actorId: reporterId,
            });
            return {
                ...issue,
                key: `${project.key}-${issue.issueNumber}`,
                labels: dto.labels || [],
            };
        });
    }
    async findOne(idOrKey) {
        let issue;
        const keyMatch = idOrKey.match(/^([A-Z0-9]+)-(\d+)$/);
        if (keyMatch) {
            const projectKey = keyMatch[1];
            const issueNum = parseInt(keyMatch[2], 10);
            issue = await this.prisma.issue.findFirst({
                where: {
                    project: { key: projectKey },
                    issueNumber: issueNum,
                },
                include: {
                    project: true,
                    reporter: { select: { id: true, email: true, displayName: true } },
                    assignee: { select: { id: true, email: true, displayName: true } },
                    labels: true,
                    comments: {
                        include: {
                            user: { select: { id: true, displayName: true } },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
        }
        else {
            issue = await this.prisma.issue.findUnique({
                where: { id: idOrKey },
                include: {
                    project: true,
                    reporter: { select: { id: true, email: true, displayName: true } },
                    assignee: { select: { id: true, email: true, displayName: true } },
                    labels: true,
                    comments: {
                        include: {
                            user: { select: { id: true, displayName: true } },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
        }
        if (!issue) {
            throw new common_1.NotFoundException(`Issue "${idOrKey}" was not found.`);
        }
        return {
            ...issue,
            key: `${issue.project.key}-${issue.issueNumber}`,
            labels: issue.labels.map((l) => l.label),
        };
    }
    async update(idOrKey, dto, actorId) {
        const issueObj = await this.findOne(idOrKey);
        const { id: issueId, projectId, version: currentVersion, status: currentStatus } = issueObj;
        if (dto.status && dto.status !== currentStatus) {
            await this.workflowService.validateTransition(projectId, currentStatus, dto.status);
        }
        const { labels, version: providedVersion, ...scalarFields } = dto;
        const updateData = { ...scalarFields };
        if (dto.status && dto.status !== currentStatus) {
            const autoUpdates = await this.workflowService.getAutoActionUpdates(projectId, dto.status, issueObj.reporterId, dto.assigneeId !== undefined ? dto.assigneeId : issueObj.assigneeId);
            Object.assign(updateData, autoUpdates);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updateResult = await tx.issue.updateMany({
                where: {
                    id: issueId,
                    version: providedVersion,
                },
                data: {
                    ...updateData,
                    version: { increment: 1 },
                },
            });
            if (updateResult.count === 0) {
                throw new common_1.ConflictException('Concurrency Conflict: The issue was modified by another SDE. Please refresh your view and try again.');
            }
            if (labels !== undefined) {
                await tx.issueLabel.deleteMany({ where: { issueId } });
                if (labels.length > 0) {
                    await Promise.all(labels.map((label) => tx.issueLabel.create({
                        data: {
                            issueId,
                            label,
                        },
                    })));
                }
            }
            return tx.issue.findUnique({
                where: { id: issueId },
                include: {
                    project: true,
                    reporter: { select: { id: true, email: true, displayName: true } },
                    assignee: { select: { id: true, email: true, displayName: true } },
                    labels: true,
                },
            });
        });
        if (!result) {
            throw new common_1.NotFoundException(`Failed to retrieve updated issue.`);
        }
        const updatedIssue = {
            ...result,
            key: `${result.project.key}-${result.issueNumber}`,
            labels: result.labels.map((l) => l.label),
        };
        this.eventEmitter.emit('issue.updated', {
            issue: updatedIssue,
            oldValue: {
                status: currentStatus,
                assigneeId: issueObj.assigneeId,
                title: issueObj.title,
                description: issueObj.description,
                version: currentVersion,
            },
            newValue: {
                status: updatedIssue.status,
                assigneeId: updatedIssue.assigneeId,
                title: updatedIssue.title,
                description: updatedIssue.description,
                version: updatedIssue.version,
            },
            actorId,
        });
        return updatedIssue;
    }
    async transition(idOrKey, dto, actorId) {
        const issueObj = await this.findOne(idOrKey);
        const updateDto = {
            status: dto.status,
            version: dto.version,
        };
        return this.update(issueObj.id, updateDto, actorId);
    }
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService,
        workflow_service_1.WorkflowService,
        event_emitter_1.EventEmitter2])
], IssuesService);
//# sourceMappingURL=issues.service.js.map