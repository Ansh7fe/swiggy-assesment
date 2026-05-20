import { Injectable, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validates if a transition from fromStatus to toStatus is permitted.
   * Throws UnprocessableEntityException listing allowed states if invalid.
   */
  async validateTransition(projectId: string, fromStatus: string, toStatus: string): Promise<boolean> {
    // If status is identical, bypass validation
    if (fromStatus === toStatus) {
      return true;
    }

    const workflow = await this.prisma.workflow.findUnique({
      where: { projectId },
    });

    if (!workflow) {
      throw new NotFoundException(`No workflow is configured for project ID "${projectId}".`);
    }

    // Find the transition
    const transition = await this.prisma.workflowTransition.findFirst({
      where: {
        workflowId: workflow.id,
        fromStatus,
        toStatus,
      },
    });

    if (!transition) {
      // Fetch allowed targets to build a clean feedback message
      const allowed = await this.prisma.workflowTransition.findMany({
        where: {
          workflowId: workflow.id,
          fromStatus,
        },
        select: { toStatus: true },
      });

      const allowedList = allowed.map((a) => a.toStatus);
      throw new UnprocessableEntityException({
        message: `Invalid state transition from "${fromStatus}" to "${toStatus}".`,
        allowedTransitions: allowedList,
      });
    }

    return true;
  }

  /**
   * Returns list of statuses that an issue can move to from its current status
   */
  async getAllowedTransitions(projectId: string, fromStatus: string): Promise<string[]> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { projectId },
    });

    if (!workflow) {
      return [];
    }

    const transitions = await this.prisma.workflowTransition.findMany({
      where: {
        workflowId: workflow.id,
        fromStatus,
      },
      select: { toStatus: true },
    });

    return transitions.map((t) => t.toStatus);
  }

  /**
   * Executes auto actions when an issue lands in a target status
   * E.g., If state becomes "IN_REVIEW" and assignee is null, auto-assign reporter.
   */
  async getAutoActionUpdates(projectId: string, targetStatus: string, reporterId: string, currentAssigneeId?: string | null) {
    const updates: Record<string, any> = {};

    if (targetStatus.toUpperCase() === 'IN_REVIEW' && !currentAssigneeId) {
      // Auto-assign to reporter as fallback reviewer/lead
      updates.assigneeId = reporterId;
    }

    return updates;
  }
}
