import { PrismaService } from '../../prisma/prisma.service';
interface IssueEventPayload {
    issue: any;
    oldValue?: any;
    newValue?: any;
    actorId: string;
}
interface CommentEventPayload {
    comment: any;
    issue: any;
    actorId: string;
}
export declare class ActivityService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleIssueCreated(payload: IssueEventPayload): Promise<void>;
    handleIssueUpdated(payload: IssueEventPayload): Promise<void>;
    handleCommentAdded(payload: CommentEventPayload): Promise<void>;
    findProjectActivity(projectId: string, limit?: number, cursor?: string): Promise<({
        issue: {
            title: string;
            id: string;
            issueNumber: number;
        } | null;
        actor: {
            email: string;
            displayName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        projectId: string;
        issueId: string | null;
        action: string;
        metadata: import("@prisma/client/runtime/client").JsonValue;
        actorId: string;
    })[]>;
}
export {};
