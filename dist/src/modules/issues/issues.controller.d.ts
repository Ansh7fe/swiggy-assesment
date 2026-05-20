import { IssuesService } from './issues.service';
import { CreateIssueDto, UpdateIssueDto, TransitionIssueDto } from './dto/issue.dto';
export declare class IssuesController {
    private issuesService;
    constructor(issuesService: IssuesService);
    create(projectId: string, dto: CreateIssueDto, userId: string): Promise<{
        key: string;
        labels: string[];
        project: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            key: string;
            issueCounter: number;
            createdById: string;
        };
        reporter: {
            email: string;
            displayName: string;
            id: string;
        };
        assignee: {
            email: string;
            displayName: string;
            id: string;
        } | null;
        type: import("@prisma/client").$Enums.IssueType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        issueNumber: number;
        status: string;
        priority: import("@prisma/client").$Enums.IssuePriority;
        assigneeId: string | null;
        reporterId: string;
        sprintId: string | null;
        parentId: string | null;
        storyPoints: number | null;
        version: number;
    }>;
    findOne(idOrKey: string): Promise<{
        key: string;
        labels: string[];
        comments: ({
            user: {
                displayName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            issueId: string;
            userId: string;
        })[];
        project: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            key: string;
            issueCounter: number;
            createdById: string;
        };
        reporter: {
            email: string;
            displayName: string;
            id: string;
        };
        assignee: {
            email: string;
            displayName: string;
            id: string;
        } | null;
        type: import("@prisma/client").$Enums.IssueType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        issueNumber: number;
        status: string;
        priority: import("@prisma/client").$Enums.IssuePriority;
        assigneeId: string | null;
        reporterId: string;
        sprintId: string | null;
        parentId: string | null;
        storyPoints: number | null;
        version: number;
    }>;
    update(idOrKey: string, dto: UpdateIssueDto, userId: string): Promise<{
        key: string;
        labels: string[];
        project: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            key: string;
            issueCounter: number;
            createdById: string;
        };
        reporter: {
            email: string;
            displayName: string;
            id: string;
        };
        assignee: {
            email: string;
            displayName: string;
            id: string;
        } | null;
        type: import("@prisma/client").$Enums.IssueType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        issueNumber: number;
        status: string;
        priority: import("@prisma/client").$Enums.IssuePriority;
        assigneeId: string | null;
        reporterId: string;
        sprintId: string | null;
        parentId: string | null;
        storyPoints: number | null;
        version: number;
    }>;
    transition(idOrKey: string, dto: TransitionIssueDto, userId: string): Promise<{
        key: string;
        labels: string[];
        project: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            key: string;
            issueCounter: number;
            createdById: string;
        };
        reporter: {
            email: string;
            displayName: string;
            id: string;
        };
        assignee: {
            email: string;
            displayName: string;
            id: string;
        } | null;
        type: import("@prisma/client").$Enums.IssueType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        issueNumber: number;
        status: string;
        priority: import("@prisma/client").$Enums.IssuePriority;
        assigneeId: string | null;
        reporterId: string;
        sprintId: string | null;
        parentId: string | null;
        storyPoints: number | null;
        version: number;
    }>;
}
