import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Safe SQL-Injection-Proof Full Text Search using GIN index + plainto_tsquery
   * with structured filters and cursor pagination.
   */
  async searchIssues(params: {
    q?: string;
    projectId?: string;
    status?: string;
    assigneeId?: string;
    priority?: string;
    limit?: number;
    cursor?: string; // Expecting timestamp of the last issue seen
  }) {
    const limit = params.limit || 20;
    const conditions: Prisma.Sql[] = [];

    // 1. Full-Text Search Match
    if (params.q && params.q.trim().length > 0) {
      conditions.push(Prisma.sql`to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, '')) @@ plainto_tsquery('english', ${params.q})`);
    }

    // 2. Structured Filters
    if (params.projectId) {
      conditions.push(Prisma.sql`i."projectId" = ${params.projectId}`);
    }
    if (params.status) {
      conditions.push(Prisma.sql`i.status = ${params.status}`);
    }
    if (params.assigneeId) {
      conditions.push(Prisma.sql`i."assigneeId" = ${params.assigneeId}`);
    }
    if (params.priority) {
      conditions.push(Prisma.sql`i.priority::text = ${params.priority}`);
    }

    // 3. Cursor Pagination
    if (params.cursor) {
      const cursorDate = new Date(params.cursor);
      if (!isNaN(cursorDate.getTime())) {
        conditions.push(Prisma.sql`i."createdAt" < ${cursorDate}`);
      }
    }

    // Combine conditions
    const whereClause = conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    // Execute safe dynamic SQL query
    const issues = await this.prisma.$queryRaw<any[]>`
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

    // Format output keys (e.g. PROJ-1)
    const formattedIssues = issues.map((issue) => ({
      ...issue,
      key: `${issue.projectKey}-${issue.issueNumber}`,
    }));

    // Determine the next cursor
    const nextCursor = formattedIssues.length === limit
      ? formattedIssues[formattedIssues.length - 1].createdAt
      : null;

    return {
      issues: formattedIssues,
      nextCursor,
    };
  }
}
