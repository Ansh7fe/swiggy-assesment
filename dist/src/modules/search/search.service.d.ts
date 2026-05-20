import { PrismaService } from '../../prisma/prisma.service';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    searchIssues(params: {
        q?: string;
        projectId?: string;
        status?: string;
        assigneeId?: string;
        priority?: string;
        limit?: number;
        cursor?: string;
    }): Promise<{
        issues: any[];
        nextCursor: any;
    }>;
}
