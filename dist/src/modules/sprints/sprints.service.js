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
exports.SprintsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const event_emitter_1 = require("@nestjs/event-emitter");
let SprintsService = class SprintsService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async create(projectId, dto) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID "${projectId}" does not exist.`);
        }
        return this.prisma.sprint.create({
            data: {
                projectId,
                name: dto.name,
                goal: dto.goal,
                status: client_1.SprintStatus.PLANNING,
            },
        });
    }
    async start(sprintId, dto, actorId) {
        const sprint = await this.prisma.sprint.findUnique({
            where: { id: sprintId },
        });
        if (!sprint) {
            throw new common_1.NotFoundException(`Sprint "${sprintId}" was not found.`);
        }
        if (sprint.status !== client_1.SprintStatus.PLANNING) {
            throw new common_1.BadRequestException(`Only sprints in PLANNING state can be started. Current status: ${sprint.status}`);
        }
        const activeSprint = await this.prisma.sprint.findFirst({
            where: {
                projectId: sprint.projectId,
                status: client_1.SprintStatus.ACTIVE,
            },
        });
        if (activeSprint) {
            throw new common_1.BadRequestException(`Cannot start sprint: Sprint "${activeSprint.name}" is already ACTIVE in this project.`);
        }
        const updated = await this.prisma.sprint.update({
            where: { id: sprintId },
            data: {
                status: client_1.SprintStatus.ACTIVE,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
            },
        });
        this.eventEmitter.emit('sprint.started', {
            sprint: updated,
            actorId,
        });
        return updated;
    }
    async complete(sprintId, dto, actorId) {
        const sprint = await this.prisma.sprint.findUnique({
            where: { id: sprintId },
            include: { issues: true },
        });
        if (!sprint) {
            throw new common_1.NotFoundException(`Sprint "${sprintId}" was not found.`);
        }
        if (sprint.status !== client_1.SprintStatus.ACTIVE) {
            throw new common_1.BadRequestException(`Only ACTIVE sprints can be completed. Current status: ${sprint.status}`);
        }
        if (dto.carryOverSprintId) {
            const carryOverSprint = await this.prisma.sprint.findUnique({
                where: { id: dto.carryOverSprintId },
            });
            if (!carryOverSprint) {
                throw new common_1.NotFoundException(`Carry over destination Sprint "${dto.carryOverSprintId}" does not exist.`);
            }
            if (carryOverSprint.projectId !== sprint.projectId) {
                throw new common_1.BadRequestException('Carry over sprint must belong to the same project.');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const completedIssues = sprint.issues.filter((issue) => issue.status.toUpperCase() === 'DONE');
            const incompleteIssues = sprint.issues.filter((issue) => issue.status.toUpperCase() !== 'DONE');
            const velocity = completedIssues.reduce((acc, issue) => acc + (issue.storyPoints || 0), 0);
            const carryOverIds = dto.carryOverIssueIds || incompleteIssues.map((i) => i.id);
            const toCarryOver = incompleteIssues.filter((i) => carryOverIds.includes(i.id));
            const toBacklog = incompleteIssues.filter((i) => !carryOverIds.includes(i.id));
            if (toCarryOver.length > 0 && dto.carryOverSprintId) {
                await tx.issue.updateMany({
                    where: { id: { in: toCarryOver.map((i) => i.id) } },
                    data: { sprintId: dto.carryOverSprintId },
                });
            }
            else if (toCarryOver.length > 0) {
                await tx.issue.updateMany({
                    where: { id: { in: toCarryOver.map((i) => i.id) } },
                    data: { sprintId: null },
                });
            }
            if (toBacklog.length > 0) {
                await tx.issue.updateMany({
                    where: { id: { in: toBacklog.map((i) => i.id) } },
                    data: { sprintId: null },
                });
            }
            const completedSprint = await tx.sprint.update({
                where: { id: sprintId },
                data: { status: client_1.SprintStatus.COMPLETED },
            });
            await tx.activityLog.create({
                data: {
                    projectId: sprint.projectId,
                    actorId,
                    action: 'SPRINT_COMPLETED',
                    metadata: {
                        sprintId,
                        sprintName: sprint.name,
                        velocity,
                        completedIssueIds: completedIssues.map((i) => i.id),
                        carriedOverIssueIds: toCarryOver.map((i) => i.id),
                        backloggedIssueIds: toBacklog.map((i) => i.id),
                    },
                },
            });
            this.eventEmitter.emit('sprint.completed', {
                sprint: completedSprint,
                velocity,
                actorId,
            });
            return {
                sprint: completedSprint,
                velocity,
                completedIssues: completedIssues.map((i) => ({ id: i.id, title: i.title, storyPoints: i.storyPoints })),
                carriedOverIssues: toCarryOver.map((i) => ({ id: i.id, title: i.title, storyPoints: i.storyPoints })),
                backloggedIssues: toBacklog.map((i) => ({ id: i.id, title: i.title, storyPoints: i.storyPoints })),
            };
        });
    }
    async findProjectSprints(projectId) {
        return this.prisma.sprint.findMany({
            where: { projectId },
            include: {
                _count: {
                    select: { issues: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.SprintsService = SprintsService;
exports.SprintsService = SprintsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], SprintsService);
//# sourceMappingURL=sprints.service.js.map