import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { WorkflowService } from '../workflow/workflow.service';
import { CreateIssueDto, UpdateIssueDto, TransitionIssueDto } from './dto/issue.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class IssuesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private workflowService: WorkflowService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create an Issue within a project. Uses transactional increment for issue number sequence.
   */
  async create(projectId: string, dto: CreateIssueDto, reporterId: string) {
    // 1. Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" does not exist.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 2. Safe transaction-level increment of project counter
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { issueCounter: { increment: 1 } },
        select: { issueCounter: true },
      });

      const issueNumber = updatedProject.issueCounter;

      // 3. Create the issue, defaulting to "TODO" status
      const issue = await tx.issue.create({
        data: {
          projectId,
          issueNumber,
          type: dto.type,
          title: dto.title,
          description: dto.description,
          status: 'TODO', // Seeding default initial state
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

      // 4. Handle Labels
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

      // Add reporter as watcher automatically
      await tx.watcher.create({
        data: {
          issueId: issue.id,
          userId: reporterId,
        },
      });

      // 5. Emit creation event
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

  /**
   * Find an issue by UUID or custom project key (e.g., "PROJ-12").
   */
  async findOne(idOrKey: string) {
    let issue;

    // Check if it matches key format (e.g. "PROJ-1")
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
      // Find by UUID
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

  /**
   * Update Issue fields. Enforces Optimistic Locking using the 'version' property.
   */
  async update(idOrKey: string, dto: UpdateIssueDto, actorId: string) {
    // 1. Fetch current issue state
    const issueObj = await this.findOne(idOrKey);
    const { id: issueId, projectId, version: currentVersion, status: currentStatus } = issueObj;

    // 2. Validate transition if status is changing
    if (dto.status && dto.status !== currentStatus) {
      await this.workflowService.validateTransition(projectId, currentStatus, dto.status);
    }

    // 3. Prepare data updates
    const { labels, version: providedVersion, ...scalarFields } = dto;

    // Build fields updates
    const updateData: Record<string, any> = { ...scalarFields };

    // Handle auto assignment if status changes to IN_REVIEW
    if (dto.status && dto.status !== currentStatus) {
      const autoUpdates = await this.workflowService.getAutoActionUpdates(
        projectId,
        dto.status,
        issueObj.reporterId,
        dto.assigneeId !== undefined ? dto.assigneeId : issueObj.assigneeId,
      );
      Object.assign(updateData, autoUpdates);
    }

    // Perform DB update inside a transaction to enforce version locking
    const result = await this.prisma.$transaction(async (tx) => {
      // Execute the update filtering by provided version
      const updateResult = await tx.issue.updateMany({
        where: {
          id: issueId,
          version: providedVersion, // Enforce optimistic lock
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

      // Handle labels modification if provided
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

      // Return the newly updated issue
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

    // 4. Emit update event
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

  /**
   * Shortcut dedicated status-only transition API (POST /issues/:id/transitions).
   * Validates state transition + auto-actions + version concurrency lock.
   */
  async transition(idOrKey: string, dto: TransitionIssueDto, actorId: string) {
    const issueObj = await this.findOne(idOrKey);
    
    // Convert to UpdateIssueDto pattern to leverage full validation
    const updateDto: UpdateIssueDto = {
      status: dto.status,
      version: dto.version,
    };

    return this.update(issueObj.id, updateDto, actorId);
  }
}
