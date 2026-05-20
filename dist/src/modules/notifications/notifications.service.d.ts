import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleIssueUpdatedNotification(payload: {
        issue: any;
        oldValue: any;
        newValue: any;
        actorId: string;
    }): Promise<void>;
    handleCommentAddedNotification(payload: {
        comment: any;
        issue: any;
        actorId: string;
    }): Promise<void>;
    getUserNotifications(userId: string, isRead?: boolean): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        isRead: boolean;
    }[]>;
    markAsRead(notificationId: string, userId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
