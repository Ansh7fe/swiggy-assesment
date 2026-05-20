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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const projectKey = dto.key.toUpperCase();
        const existing = await this.prisma.project.findUnique({
            where: { key: projectKey },
        });
        if (existing) {
            throw new common_1.ConflictException(`Project key "${projectKey}" is already taken.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    key: projectKey,
                    name: dto.name,
                    description: dto.description,
                    createdById: userId,
                },
            });
            const workflow = await tx.workflow.create({
                data: {
                    projectId: project.id,
                    name: 'Standard Software Development Workflow',
                },
            });
            const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
            await Promise.all(statuses.map((status, index) => tx.workflowStatus.create({
                data: {
                    workflowId: workflow.id,
                    name: status,
                    position: index + 1,
                },
            })));
            const transitions = [
                { from: 'TODO', to: 'IN_PROGRESS' },
                { from: 'TODO', to: 'DONE' },
                { from: 'IN_PROGRESS', to: 'IN_REVIEW' },
                { from: 'IN_PROGRESS', to: 'TODO' },
                { from: 'IN_REVIEW', to: 'DONE' },
                { from: 'IN_REVIEW', to: 'IN_PROGRESS' },
                { from: 'DONE', to: 'IN_PROGRESS' },
            ];
            await Promise.all(transitions.map((t) => tx.workflowTransition.create({
                data: {
                    workflowId: workflow.id,
                    fromStatus: t.from,
                    toStatus: t.to,
                },
            })));
            return project;
        });
    }
    async findAll() {
        return this.prisma.project.findMany({
            include: {
                creator: {
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
    async findOne(idOrKey) {
        const project = await this.prisma.project.findFirst({
            where: {
                OR: [{ id: idOrKey }, { key: idOrKey.toUpperCase() }],
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                    },
                },
                workflows: {
                    include: {
                        statuses: true,
                        transitions: true,
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with key or ID "${idOrKey}" was not found.`);
        }
        return project;
    }
    async incrementIssueCounter(projectId) {
        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: { issueCounter: { increment: 1 } },
            select: { issueCounter: true },
        });
        return project.issueCounter;
    }
    async getBoard(idOrKey) {
        const project = await this.findOne(idOrKey);
        const workflow = await this.prisma.workflow.findUnique({
            where: { projectId: project.id },
            include: {
                statuses: { orderBy: { position: 'asc' } },
            },
        });
        const statuses = workflow ? workflow.statuses : [];
        const issues = await this.prisma.issue.findMany({
            where: { projectId: project.id },
            include: {
                assignee: { select: { id: true, email: true, displayName: true } },
                reporter: { select: { id: true, email: true, displayName: true } },
                labels: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
        const columns = statuses.map((status) => {
            const columnIssues = issues
                .filter((issue) => issue.status === status.name)
                .map((issue) => ({
                ...issue,
                key: `${project.key}-${issue.issueNumber}`,
                labels: issue.labels.map((l) => l.label),
            }));
            return {
                status: status.name,
                position: status.position,
                issues: columnIssues,
            };
        });
        return { columns };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map