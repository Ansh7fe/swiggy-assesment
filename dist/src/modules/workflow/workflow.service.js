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
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkflowService = class WorkflowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateTransition(projectId, fromStatus, toStatus) {
        if (fromStatus === toStatus) {
            return true;
        }
        const workflow = await this.prisma.workflow.findUnique({
            where: { projectId },
        });
        if (!workflow) {
            throw new common_1.NotFoundException(`No workflow is configured for project ID "${projectId}".`);
        }
        const transition = await this.prisma.workflowTransition.findFirst({
            where: {
                workflowId: workflow.id,
                fromStatus,
                toStatus,
            },
        });
        if (!transition) {
            const allowed = await this.prisma.workflowTransition.findMany({
                where: {
                    workflowId: workflow.id,
                    fromStatus,
                },
                select: { toStatus: true },
            });
            const allowedList = allowed.map((a) => a.toStatus);
            throw new common_1.UnprocessableEntityException({
                message: `Invalid state transition from "${fromStatus}" to "${toStatus}".`,
                allowedTransitions: allowedList,
            });
        }
        return true;
    }
    async getAllowedTransitions(projectId, fromStatus) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { projectId },
        });
        if (!workflow) {
            return [];
        }
        const transitions = await this.prisma.workflowTransition.findMany({
            where: {
                workflowId: workflow.id,
                fromStatus,
            },
            select: { toStatus: true },
        });
        return transitions.map((t) => t.toStatus);
    }
    async getAutoActionUpdates(projectId, targetStatus, reporterId, currentAssigneeId) {
        const updates = {};
        if (targetStatus.toUpperCase() === 'IN_REVIEW' && !currentAssigneeId) {
            updates.assigneeId = reporterId;
        }
        return updates;
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map