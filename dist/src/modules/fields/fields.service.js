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
exports.FieldsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FieldsService = class FieldsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCustomField(projectId, dto) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project "${projectId}" does not exist.`);
        }
        if (dto.type === 'DROPDOWN' && (!dto.config || dto.config.length === 0)) {
            throw new common_1.BadRequestException('Dropdown fields must configure a list of options in "config".');
        }
        const configJson = dto.config ? JSON.stringify(dto.config) : '[]';
        return this.prisma.customField.create({
            data: {
                projectId,
                name: dto.name,
                type: dto.type,
                config: configJson,
            },
        });
    }
    async setCustomFieldValue(issueId, dto) {
        const issue = await this.prisma.issue.findUnique({
            where: { id: issueId },
        });
        if (!issue) {
            throw new common_1.NotFoundException(`Issue "${issueId}" does not exist.`);
        }
        const field = await this.prisma.customField.findUnique({
            where: { id: dto.fieldId },
        });
        if (!field) {
            throw new common_1.NotFoundException(`Custom Field "${dto.fieldId}" does not exist.`);
        }
        if (field.projectId !== issue.projectId) {
            throw new common_1.BadRequestException('Custom Field must belong to the same project as the issue.');
        }
        if (field.type === 'DROPDOWN') {
            const allowed = JSON.parse(field.config);
            if (!allowed.includes(dto.value)) {
                throw new common_1.BadRequestException(`Invalid choice "${dto.value}". Allowed options are: ${allowed.join(', ')}`);
            }
        }
        const valueJson = JSON.stringify(dto.value);
        return this.prisma.issueCustomFieldValue.upsert({
            where: {
                issueId_fieldId: {
                    issueId,
                    fieldId: dto.fieldId,
                },
            },
            update: { value: valueJson },
            create: {
                issueId,
                fieldId: dto.fieldId,
                value: valueJson,
            },
        });
    }
    async addWatcher(issueId, userId) {
        const issue = await this.prisma.issue.findUnique({
            where: { id: issueId },
        });
        if (!issue) {
            throw new common_1.NotFoundException(`Issue "${issueId}" does not exist.`);
        }
        return this.prisma.watcher.upsert({
            where: {
                issueId_userId: {
                    issueId,
                    userId,
                },
            },
            update: {},
            create: {
                issueId,
                userId,
            },
        });
    }
    async removeWatcher(issueId, userId) {
        const watcher = await this.prisma.watcher.findUnique({
            where: {
                issueId_userId: {
                    issueId,
                    userId,
                },
            },
        });
        if (!watcher) {
            return { message: 'User is not watching this issue.' };
        }
        await this.prisma.watcher.delete({
            where: {
                issueId_userId: {
                    issueId,
                    userId,
                },
            },
        });
        return { message: 'Successfully unsubscribed from issue updates.' };
    }
};
exports.FieldsService = FieldsService;
exports.FieldsService = FieldsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldsService);
//# sourceMappingURL=fields.service.js.map