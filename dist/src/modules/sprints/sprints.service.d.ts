import { PrismaService } from '../../prisma/prisma.service';
import { CreateSprintDto, StartSprintDto, CompleteSprintDto } from './dto/sprint.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class SprintsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
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
    start(sprintId: string, dto: StartSprintDto, actorId: string): Promise<{
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
    complete(sprintId: string, dto: CompleteSprintDto, actorId: string): Promise<{
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
