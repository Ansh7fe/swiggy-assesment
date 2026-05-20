import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    server: Server;
    private readonly logger;
    private presenceMap;
    constructor(prisma: PrismaService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinProject(client: Socket, data: {
        projectId: string;
        userDisplayName: string;
    }): Promise<void>;
    handleLeaveProject(client: Socket, data: {
        projectId: string;
    }): void;
    handleSyncEvents(client: Socket, data: {
        projectId: string;
        lastSyncedAt: string;
    }): Promise<void>;
    handleIssueCreatedBroadcast(payload: {
        issue: any;
        actorId: string;
    }): void;
    handleIssueUpdatedBroadcast(payload: {
        issue: any;
        oldValue: any;
        newValue: any;
    }): void;
    handleSprintStartedBroadcast(payload: {
        sprint: any;
    }): void;
    handleSprintCompletedBroadcast(payload: {
        sprint: any;
        velocity: number;
    }): void;
    private broadcastPresence;
}
