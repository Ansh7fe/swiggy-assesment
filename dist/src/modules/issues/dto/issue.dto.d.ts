import { IssueType, IssuePriority } from '@prisma/client';
export declare class CreateIssueDto {
    type: IssueType;
    title: string;
    description?: string;
    priority?: IssuePriority;
    assigneeId?: string;
    sprintId?: string;
    storyPoints?: number;
    parentId?: string;
    labels?: string[];
}
export declare class UpdateIssueDto {
    type?: IssueType;
    title?: string;
    description?: string;
    priority?: IssuePriority;
    assigneeId?: string;
    sprintId?: string;
    storyPoints?: number;
    status?: string;
    version: number;
    labels?: string[];
}
export declare class TransitionIssueDto {
    status: string;
    version: number;
}
