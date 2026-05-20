import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { WorkflowService } from '../workflow/workflow.service';
import {
  CreateIssueDto,
  UpdateIssueDto,
  TransitionIssueDto,
} from './dto/issue.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class IssuesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private workflowService: WorkflowService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(projectId: string, dto: CreateIssueDto, reporterId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(
        `Project with ID "${projectId}" does not exist.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { issueCounter: { increment: 1 } },
        select: { issueCounter: true },
      });

      const issueNumber = updatedProject.issueCounter;

      const issue = await tx.issue.create({
        data: {
          projectId,
          issueNumber,
          type: dto.type,
          title: dto.title,
          description: dto.description,
          status: 'TODO',
          priority: dto.priority || 'MEDIUM',
          assigneeId: dto.assigneeId || null,
          sprintId: dto.sprintId || null,
          parentId: dto.parentId || null,
          storyPoints: dto.storyPoints || null,
          reporterId,
        },
        include: {
          project: true,
          reporter: { select: { id: true, email: true, displayName: true } },
          assignee: { select: { id: true, email: true, displayName: true } },
        },
      });

      if (dto.labels && dto.labels.length > 0) {
        await Promise.all(
          dto.labels.map((label) =>
            tx.issueLabel.create({
              data: {
                issueId: issue.id,
                label,
              },
            }),
          ),
        );
      }

      await tx.watcher.create({
        data: {
          issueId: issue.id,
          userId: reporterId,
        },
      });

      this.eventEmitter.emit('issue.created', {
        issue,
        actorId: reporterId,
      });

      return {
        ...issue,
        key: `${project.key}-${issue.issueNumber}`,
        labels: dto.labels || [],
      };
    });
  }

  async findOne(idOrKey: string) {
    let issue;

    const keyMatch = idOrKey.match(/^([A-Z0-9]+)-(\d+)$/);

    if (keyMatch) {
      const projectKey = keyMatch[1];
      const issueNum = parseInt(keyMatch[2], 10);

      issue = await this.prisma.issue.findFirst({
        where: {
          project: { key: projectKey },
          issueNumber: issueNum,
        },
        include: {
          project: true,
          reporter: { select: { id: true, email: true, displayName: true } },
          assignee: { select: { id: true, email: true, displayName: true } },
          labels: true,
          comments: {
            include: {
              user: { select: { id: true, displayName: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } else {
      issue = await this.prisma.issue.findUnique({
        where: { id: idOrKey },
        include: {
          project: true,
          reporter: { select: { id: true, email: true, displayName: true } },
          assignee: { select: { id: true, email: true, displayName: true } },
          labels: true,
          comments: {
            include: {
              user: { select: { id: true, displayName: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!issue) {
      throw new NotFoundException(`Issue "${idOrKey}" was not found.`);
    }

    return {
      ...issue,
      key: `${issue.project.key}-${issue.issueNumber}`,
      labels: issue.labels.map((l) => l.label),
    };
  }

  async update(idOrKey: string, dto: UpdateIssueDto, actorId: string) {
    const issueObj = await this.findOne(idOrKey);
    const {
      id: issueId,
      projectId,
      version: currentVersion,
      status: currentStatus,
    } = issueObj;

    if (dto.status && dto.status !== currentStatus) {
      await this.workflowService.validateTransition(
        projectId,
        currentStatus,
        dto.status,
      );
    }

    const { labels, version: providedVersion, ...scalarFields } = dto;

    const updateData: Record<string, any> = { ...scalarFields };

    if (dto.status && dto.status !== currentStatus) {
      const autoUpdates = await this.workflowService.getAutoActionUpdates(
        projectId,
        dto.status,
        issueObj.reporterId,
        dto.assigneeId !== undefined ? dto.assigneeId : issueObj.assigneeId,
      );
      Object.assign(updateData, autoUpdates);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.issue.updateMany({
        where: {
          id: issueId,
          version: providedVersion,
        },
        data: {
          ...updateData,
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException(
          'Concurrency Conflict: The issue was modified by another SDE. Please refresh your view and try again.',
        );
      }

      if (labels !== undefined) {
        await tx.issueLabel.deleteMany({ where: { issueId } });
        if (labels.length > 0) {
          await Promise.all(
            labels.map((label) =>
              tx.issueLabel.create({
                data: {
                  issueId,
                  label,
                },
              }),
            ),
          );
        }
      }

      return tx.issue.findUnique({
        where: { id: issueId },
        include: {
          project: true,
          reporter: { select: { id: true, email: true, displayName: true } },
          assignee: { select: { id: true, email: true, displayName: true } },
          labels: true,
        },
      });
    });

    if (!result) {
      throw new NotFoundException(`Failed to retrieve updated issue.`);
    }

    const updatedIssue = {
      ...result,
      key: `${result.project.key}-${result.issueNumber}`,
      labels: result.labels.map((l) => l.label),
    };

    this.eventEmitter.emit('issue.updated', {
      issue: updatedIssue,
      oldValue: {
        status: currentStatus,
        assigneeId: issueObj.assigneeId,
        title: issueObj.title,
        description: issueObj.description,
        version: currentVersion,
      },
      newValue: {
        status: updatedIssue.status,
        assigneeId: updatedIssue.assigneeId,
        title: updatedIssue.title,
        description: updatedIssue.description,
        version: updatedIssue.version,
      },
      actorId,
    });

    return updatedIssue;
  }

  async transition(idOrKey: string, dto: TransitionIssueDto, actorId: string) {
    const issueObj = await this.findOne(idOrKey);

    const updateDto: UpdateIssueDto = {
      status: dto.status,
      version: dto.version,
    };

    return this.update(issueObj.id, updateDto, actorId);
  }
}
