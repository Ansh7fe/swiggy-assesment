import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/project.dto';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProjectDto, userId: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        issueCounter: number;
        createdById: string;
    }>;
    findAll(): Promise<({
        creator: {
            email: string;
            displayName: string;
            id: string;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        issueCounter: number;
        createdById: string;
    })[]>;
    findOne(idOrKey: string): Promise<{
        creator: {
            email: string;
            displayName: string;
            id: string;
        };
        workflows: ({
            statuses: {
                id: string;
                name: string;
                position: number;
                workflowId: string;
            }[];
            transitions: {
                id: string;
                workflowId: string;
                fromStatus: string;
                toStatus: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            projectId: string;
        })[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        issueCounter: number;
        createdById: string;
    }>;
    incrementIssueCounter(projectId: string): Promise<number>;
    getBoard(idOrKey: string): Promise<{
        columns: {
            status: string;
            position: number;
            issues: {
                key: string;
                labels: string[];
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
            }[];
        }[];
    }>;
}
