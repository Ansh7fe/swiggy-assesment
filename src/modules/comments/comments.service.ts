import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a flat comment on a specific issue and trigger decoupling event.
   */
  async create(issueId: string, dto: CreateCommentDto, userId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID "${issueId}" does not exist.`);
    }

    const comment = await this.prisma.comment.create({
      data: {
        issueId,
        userId,
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    // Trigger comment added event
    this.eventEmitter.emit('comment.added', {
      comment,
      issue,
      actorId: userId,
    });

    return comment;
  }

  /**
   * Fetch all comments for an issue, sorted newest first.
   */
  async findIssueComments(issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID "${issueId}" does not exist.`);
    }

    return this.prisma.comment.findMany({
      where: { issueId },
      include: {
        user: {
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
}
