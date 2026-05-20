import { ActivityService } from './activity.service';
export declare class ActivityController {
    private activityService;
    constructor(activityService: ActivityService);
    findProjectActivity(projectId: string, limit?: string, cursor?: string): Promise<({
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
