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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SearchService = class SearchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchIssues(params) {
        const limit = params.limit || 20;
        const conditions = [];
        if (params.q && params.q.trim().length > 0) {
            conditions.push(client_1.Prisma.sql `to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, '')) @@ plainto_tsquery('english', ${params.q})`);
        }
        if (params.projectId) {
            conditions.push(client_1.Prisma.sql `i."projectId" = ${params.projectId}`);
        }
        if (params.status) {
            conditions.push(client_1.Prisma.sql `i.status = ${params.status}`);
        }
        if (params.assigneeId) {
            conditions.push(client_1.Prisma.sql `i."assigneeId" = ${params.assigneeId}`);
        }
        if (params.priority) {
            conditions.push(client_1.Prisma.sql `i.priority::text = ${params.priority}`);
        }
        if (params.cursor) {
            const cursorDate = new Date(params.cursor);
            if (!isNaN(cursorDate.getTime())) {
                conditions.push(client_1.Prisma.sql `i."createdAt" < ${cursorDate}`);
            }
        }
        const whereClause = conditions.length > 0
            ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(conditions, ' AND ')}`
            : client_1.Prisma.empty;
        const issues = await this.prisma.$queryRaw `
      SELECT 
        i.id, 
        i."projectId", 
        i."issueNumber", 
        i.type::text as "type", 
        i.title, 
        i.description, 
        i.status, 
        i.priority::text as "priority", 
        i."assigneeId", 
        i."reporterId", 
        i."sprintId", 
        i."storyPoints", 
        i.version, 
        i."createdAt", 
        i."updatedAt",
        p.key as "projectKey"
      FROM issues i
      JOIN projects p ON i."projectId" = p.id
      ${whereClause}
      ORDER BY i."createdAt" DESC
      LIMIT ${limit}
    `;
        const formattedIssues = issues.map((issue) => ({
            ...issue,
            key: `${issue.projectKey}-${issue.issueNumber}`,
        }));
        const nextCursor = formattedIssues.length === limit
            ? formattedIssues[formattedIssues.length - 1].createdAt
            : null;
        return {
            issues: formattedIssues,
            nextCursor,
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map