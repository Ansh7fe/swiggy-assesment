import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    // Upper case the key
    const projectKey = dto.key.toUpperCase();

    // Check if key already exists
    const existing = await this.prisma.project.findUnique({
      where: { key: projectKey },
    });

    if (existing) {
      throw new ConflictException(`Project key "${projectKey}" is already taken.`);
    }

    // Set up project and its default workflow inside a transaction
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          key: projectKey,
          name: dto.name,
          description: dto.description,
          createdById: userId,
        },
      });

      // Initialize default Workflow for this project
      const workflow = await tx.workflow.create({
        data: {
          projectId: project.id,
          name: 'Standard Software Development Workflow',
        },
      });

      // Default Workflow Statuses
      const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
      await Promise.all(
        statuses.map((status, index) =>
          tx.workflowStatus.create({
            data: {
              workflowId: workflow.id,
              name: status,
              position: index + 1,
            },
          }),
        ),
      );

      // Default Allowed Transitions
      const transitions = [
        { from: 'TODO', to: 'IN_PROGRESS' },
        { from: 'TODO', to: 'DONE' },
        { from: 'IN_PROGRESS', to: 'IN_REVIEW' },
        { from: 'IN_PROGRESS', to: 'TODO' },
        { from: 'IN_REVIEW', to: 'DONE' },
        { from: 'IN_REVIEW', to: 'IN_PROGRESS' }, // rejection
        { from: 'DONE', to: 'IN_PROGRESS' }, // reopen
      ];

      await Promise.all(
        transitions.map((t) =>
          tx.workflowTransition.create({
            data: {
              workflowId: workflow.id,
              fromStatus: t.from,
              toStatus: t.to,
            },
          }),
        ),
      );

      return project;
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrKey: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id: idOrKey }, { key: idOrKey.toUpperCase() }],
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        workflows: {
          include: {
            statuses: true,
            transitions: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with key or ID "${idOrKey}" was not found.`);
    }

    return project;
  }

  // Safe concurrent increment for issue sequence numbering
  async incrementIssueCounter(projectId: string): Promise<number> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: { issueCounter: { increment: 1 } },
      select: { issueCounter: true },
    });
    return project.issueCounter;
  }

  /**
   * Fetches issues grouped by workflow columns.
   */
  async getBoard(idOrKey: string) {
    const project = await this.findOne(idOrKey);

    const workflow = await this.prisma.workflow.findUnique({
      where: { projectId: project.id },
      include: {
        statuses: { orderBy: { position: 'asc' } },
      },
    });

    const statuses = workflow ? workflow.statuses : [];

    const issues = await this.prisma.issue.findMany({
      where: { projectId: project.id },
      include: {
        assignee: { select: { id: true, email: true, displayName: true } },
        reporter: { select: { id: true, email: true, displayName: true } },
        labels: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const columns = statuses.map((status) => {
      const columnIssues = issues
        .filter((issue) => issue.status === status.name)
        .map((issue) => ({
          ...issue,
          key: `${project.key}-${issue.issueNumber}`,
          labels: issue.labels.map((l) => l.label),
        }));

      return {
        status: status.name,
        position: status.position,
        issues: columnIssues,
      };
    });

    return { columns };
  }
}
