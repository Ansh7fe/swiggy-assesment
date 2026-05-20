import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId: string, isRead?: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        isRead: boolean;
    }[]>;
    markAllRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markRead(id: string, userId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        isRead: boolean;
    }>;
}
