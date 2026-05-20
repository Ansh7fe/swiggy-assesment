import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
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
