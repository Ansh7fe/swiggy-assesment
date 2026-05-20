import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async validateTransition(
    projectId: string,
    fromStatus: string,
    toStatus: string,
  ): Promise<boolean> {
    if (fromStatus === toStatus) {
      return true;
    }

    const workflow = await this.prisma.workflow.findUnique({
      where: { projectId },
    });

    if (!workflow) {
      throw new NotFoundException(
        `No workflow is configured for project ID "${projectId}".`,
      );
    }

    const transition = await this.prisma.workflowTransition.findFirst({
      where: {
        workflowId: workflow.id,
        fromStatus,
        toStatus,
      },
    });

    if (!transition) {
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

  async getAllowedTransitions(
    projectId: string,
    fromStatus: string,
  ): Promise<string[]> {
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

  async getAutoActionUpdates(
    projectId: string,
    targetStatus: string,
    reporterId: string,
    currentAssigneeId?: string | null,
  ) {
    const updates: Record<string, any> = {};

    if (targetStatus.toUpperCase() === 'IN_REVIEW' && !currentAssigneeId) {
      updates.assigneeId = reporterId;
    }

    return updates;
  }
}
