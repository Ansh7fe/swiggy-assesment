import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from './dto/sprint.dto';
import { SprintStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SprintsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(projectId: string, dto: CreateSprintDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(
        `Project with ID "${projectId}" does not exist.`,
      );
    }

    return this.prisma.sprint.create({
      data: {
        projectId,
        name: dto.name,
        goal: dto.goal,
        status: SprintStatus.PLANNING,
      },
    });
  }

  async start(sprintId: string, dto: StartSprintDto, actorId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) {
      throw new NotFoundException(`Sprint "${sprintId}" was not found.`);
    }

    if (sprint.status !== SprintStatus.PLANNING) {
      throw new BadRequestException(
        `Only sprints in PLANNING state can be started. Current status: ${sprint.status}`,
      );
    }

    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        status: SprintStatus.ACTIVE,
      },
    });

    if (activeSprint) {
      throw new BadRequestException(
        `Cannot start sprint: Sprint "${activeSprint.name}" is already ACTIVE in this project.`,
      );
    }

    const updated = await this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: SprintStatus.ACTIVE,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });

    this.eventEmitter.emit('sprint.started', {
      sprint: updated,
      actorId,
    });

    return updated;
  }

  async complete(sprintId: string, dto: CompleteSprintDto, actorId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { issues: true },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint "${sprintId}" was not found.`);
    }

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new BadRequestException(
        `Only ACTIVE sprints can be completed. Current status: ${sprint.status}`,
      );
    }

    if (dto.carryOverSprintId) {
      const carryOverSprint = await this.prisma.sprint.findUnique({
        where: { id: dto.carryOverSprintId },
      });
      if (!carryOverSprint) {
        throw new NotFoundException(
          `Carry over destination Sprint "${dto.carryOverSprintId}" does not exist.`,
        );
      }
      if (carryOverSprint.projectId !== sprint.projectId) {
        throw new BadRequestException(
          'Carry over sprint must belong to the same project.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const completedIssues = sprint.issues.filter(
        (issue) => issue.status.toUpperCase() === 'DONE',
      );
      const incompleteIssues = sprint.issues.filter(
        (issue) => issue.status.toUpperCase() !== 'DONE',
      );

      const velocity = completedIssues.reduce(
        (acc, issue) => acc + (issue.storyPoints || 0),
        0,
      );

      const carryOverIds =
        dto.carryOverIssueIds || incompleteIssues.map((i) => i.id);

      const toCarryOver = incompleteIssues.filter((i) =>
        carryOverIds.includes(i.id),
      );
      const toBacklog = incompleteIssues.filter(
        (i) => !carryOverIds.includes(i.id),
      );

      if (toCarryOver.length > 0 && dto.carryOverSprintId) {
        await tx.issue.updateMany({
          where: { id: { in: toCarryOver.map((i) => i.id) } },
          data: { sprintId: dto.carryOverSprintId },
        });
      } else if (toCarryOver.length > 0) {
        await tx.issue.updateMany({
          where: { id: { in: toCarryOver.map((i) => i.id) } },
          data: { sprintId: null },
        });
      }

      if (toBacklog.length > 0) {
        await tx.issue.updateMany({
          where: { id: { in: toBacklog.map((i) => i.id) } },
          data: { sprintId: null },
        });
      }

      const completedSprint = await tx.sprint.update({
        where: { id: sprintId },
        data: { status: SprintStatus.COMPLETED },
      });

      await tx.activityLog.create({
        data: {
          projectId: sprint.projectId,
          actorId,
          action: 'SPRINT_COMPLETED',
          metadata: {
            sprintId,
            sprintName: sprint.name,
            velocity,
            completedIssueIds: completedIssues.map((i) => i.id),
            carriedOverIssueIds: toCarryOver.map((i) => i.id),
            backloggedIssueIds: toBacklog.map((i) => i.id),
          },
        },
      });

      this.eventEmitter.emit('sprint.completed', {
        sprint: completedSprint,
        velocity,
        actorId,
      });

      return {
        sprint: completedSprint,
        velocity,
        completedIssues: completedIssues.map((i) => ({
          id: i.id,
          title: i.title,
          storyPoints: i.storyPoints,
        })),
        carriedOverIssues: toCarryOver.map((i) => ({
          id: i.id,
          title: i.title,
          storyPoints: i.storyPoints,
        })),
        backloggedIssues: toBacklog.map((i) => ({
          id: i.id,
          title: i.title,
          storyPoints: i.storyPoints,
        })),
      };
    });
  }

  async findProjectSprints(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
