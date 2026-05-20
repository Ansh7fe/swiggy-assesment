import { SprintsService } from './sprints.service';
import { CreateSprintDto, StartSprintDto, CompleteSprintDto } from './dto/sprint.dto';
export declare class SprintsController {
    private sprintsService;
    constructor(sprintsService: SprintsService);
    create(projectId: string, dto: CreateSprintDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        projectId: string;
        status: import("@prisma/client").$Enums.SprintStatus;
        goal: string | null;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    start(id: string, dto: StartSprintDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        projectId: string;
        status: import("@prisma/client").$Enums.SprintStatus;
        goal: string | null;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    complete(id: string, dto: CompleteSprintDto, userId: string): Promise<{
        sprint: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            projectId: string;
            status: import("@prisma/client").$Enums.SprintStatus;
            goal: string | null;
            startDate: Date | null;
            endDate: Date | null;
        };
        velocity: number;
        completedIssues: {
            id: string;
            title: string;
            storyPoints: number | null;
        }[];
        carriedOverIssues: {
            id: string;
            title: string;
            storyPoints: number | null;
        }[];
        backloggedIssues: {
            id: string;
            title: string;
            storyPoints: number | null;
        }[];
    }>;
    findProjectSprints(projectId: string): Promise<({
        _count: {
            issues: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        projectId: string;
        status: import("@prisma/client").$Enums.SprintStatus;
        goal: string | null;
        startDate: Date | null;
        endDate: Date | null;
    })[]>;
}
