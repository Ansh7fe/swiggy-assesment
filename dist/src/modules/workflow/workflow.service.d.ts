import { PrismaService } from '../../prisma/prisma.service';
export declare class WorkflowService {
    private prisma;
    constructor(prisma: PrismaService);
    validateTransition(projectId: string, fromStatus: string, toStatus: string): Promise<boolean>;
    getAllowedTransitions(projectId: string, fromStatus: string): Promise<string[]>;
    getAutoActionUpdates(projectId: string, targetStatus: string, reporterId: string, currentAssigneeId?: string | null): Promise<Record<string, any>>;
}
