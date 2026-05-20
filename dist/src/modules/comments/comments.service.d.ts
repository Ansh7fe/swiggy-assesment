import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class CommentsService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(issueId: string, dto: CreateCommentDto, userId: string): Promise<{
        user: {
            email: string;
            displayName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        issueId: string;
        userId: string;
    }>;
    findIssueComments(issueId: string): Promise<({
        user: {
            email: string;
            displayName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        issueId: string;
        userId: string;
    })[]>;
}
