import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSprintDto, StartSprintDto, CompleteSprintDto } from './dto/sprint.dto';
import { SprintStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SprintsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new sprint for a project. Initial status is PLANNING.
   */
  async create(projectId: string, dto: CreateSprintDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" does not exist.`);
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

  /**
   * Start a sprint. Only one active sprint is allowed per project at a time.
   */
  async start(sprintId: string, dto: StartSprintDto, actorId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) {
      throw new NotFoundException(`Sprint "${sprintId}" was not found.`);
    }

    if (sprint.status !== SprintStatus.PLANNING) {
      throw new BadRequestException(`Only sprints in PLANNING state can be started. Current status: ${sprint.status}`);
    }

    // Assert that no other sprint is currently ACTIVE in this project
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

  /**
   * Complete an active sprint. Moves incomplete issues to carryOver or backlog, and computes velocity.
   */
  async complete(sprintId: string, dto: CompleteSprintDto, actorId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { issues: true },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint "${sprintId}" was not found.`);
    }

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new BadRequestException(`Only ACTIVE sprints can be completed. Current status: ${sprint.status}`);
    }

    // Verify carryOverSprint exists if provided
    if (dto.carryOverSprintId) {
      const carryOverSprint = await this.prisma.sprint.findUnique({
        where: { id: dto.carryOverSprintId },
      });
      if (!carryOverSprint) {
        throw new NotFoundException(`Carry over destination Sprint "${dto.carryOverSprintId}" does not exist.`);
      }
      if (carryOverSprint.projectId !== sprint.projectId) {
        throw new BadRequestException('Carry over sprint must belong to the same project.');
      }
    }

    // Process completion and carry-overs in a transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Separate completed vs incomplete issues
      const completedIssues = sprint.issues.filter((issue) => issue.status.toUpperCase() === 'DONE');
      const incompleteIssues = sprint.issues.filter((issue) => issue.status.toUpperCase() !== 'DONE');

      // Calculate Sprint Velocity (Sum of storyPoints for DONE issues)
      const velocity = completedIssues.reduce((acc, issue) => acc + (issue.storyPoints || 0), 0);

      // Determine which issues to carry over
      const carryOverIds = dto.carryOverIssueIds || incompleteIssues.map((i) => i.id);

      const toCarryOver = incompleteIssues.filter((i) => carryOverIds.includes(i.id));
      const toBacklog = incompleteIssues.filter((i) => !carryOverIds.includes(i.id));

      // 2. Perform carry-overs to next sprint if provided
      if (toCarryOver.length > 0 && dto.carryOverSprintId) {
        await tx.issue.updateMany({
          where: { id: { in: toCarryOver.map((i) => i.id) } },
          data: { sprintId: dto.carryOverSprintId },
        });
      } else if (toCarryOver.length > 0) {
        // Carry over requested but no sprint ID: put in backlog
        await tx.issue.updateMany({
          where: { id: { in: toCarryOver.map((i) => i.id) } },
          data: { sprintId: null },
        });
      }

      // 3. Move remainder to backlog
      if (toBacklog.length > 0) {
        await tx.issue.updateMany({
          where: { id: { in: toBacklog.map((i) => i.id) } },
          data: { sprintId: null },
        });
      }

      // 4. Update sprint status to COMPLETED
      const completedSprint = await tx.sprint.update({
        where: { id: sprintId },
        data: { status: SprintStatus.COMPLETED },
      });

      // 5. Log activity
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
        completedIssues: completedIssues.map((i) => ({ id: i.id, title: i.title, storyPoints: i.storyPoints })),
        carriedOverIssues: toCarryOver.map((i) => ({ id: i.id, title: i.title, storyPoints: i.storyPoints })),
        backloggedIssues: toBacklog.map((i) => ({ id: i.id, title: i.title, storyPoints: i.storyPoints })),
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
