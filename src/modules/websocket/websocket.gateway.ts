import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  private presenceMap = new Map<string, Map<string, string>>();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Socket Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket Client Disconnected: ${client.id}`);

    for (const [projectId, users] of this.presenceMap.entries()) {
      if (users.has(client.id)) {
        users.delete(client.id);
        this.broadcastPresence(projectId);
      }
    }
  }

  @SubscribeMessage('join_project')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string; userDisplayName: string },
  ) {
    const { projectId, userDisplayName } = data;
    if (!projectId) return;

    client.join(`project:${projectId}`);
    this.logger.log(
      `Client ${client.id} joined project room: project:${projectId}`,
    );

    if (!this.presenceMap.has(projectId)) {
      this.presenceMap.set(projectId, new Map());
    }

    this.presenceMap
      .get(projectId)!
      .set(client.id, userDisplayName || `User-${client.id.substring(0, 4)}`);

    this.broadcastPresence(projectId);
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const { projectId } = data;
    if (!projectId) return;

    client.leave(`project:${projectId}`);

    const users = this.presenceMap.get(projectId);
    if (users && users.has(client.id)) {
      users.delete(client.id);
      this.broadcastPresence(projectId);
    }
  }

  @SubscribeMessage('sync_events')
  async handleSyncEvents(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string; lastSyncedAt: string },
  ) {
    const { projectId, lastSyncedAt } = data;
    if (!projectId || !lastSyncedAt) return;

    const parsedDate = new Date(lastSyncedAt);
    if (isNaN(parsedDate.getTime())) {
      client.emit('sync_error', {
        message: 'Invalid ISO date string provided for sync.',
      });
      return;
    }

    try {
      const missedEvents = await this.prisma.activityLog.findMany({
        where: {
          projectId,
          createdAt: { gt: parsedDate },
        },
        include: {
          actor: { select: { id: true, displayName: true } },
          issue: { select: { id: true, issueNumber: true, title: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      client.emit('events_replayed', {
        lastSyncedAt,
        events: missedEvents.map((event) => ({
          id: event.id,
          action: event.action,
          issueId: event.issueId,
          issueKey: event.issue ? event.issue.issueNumber : null,
          actor: event.actor.displayName,
          metadata: event.metadata,
          createdAt: event.createdAt,
        })),
      });

      this.logger.log(
        `Replayed ${missedEvents.length} events to client ${client.id}`,
      );
    } catch (err: any) {
      this.logger.error(`Error in event replay sync: ${err.message}`);
    }
  }

  @OnEvent('issue.created')
  handleIssueCreatedBroadcast(payload: { issue: any; actorId: string }) {
    const { issue } = payload;
    this.server.to(`project:${issue.projectId}`).emit('issue_created', {
      id: issue.id,
      key: issue.key,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      storyPoints: issue.storyPoints,
      assignee: issue.assignee?.displayName || null,
    });
  }

  @OnEvent('issue.updated')
  handleIssueUpdatedBroadcast(payload: {
    issue: any;
    oldValue: any;
    newValue: any;
  }) {
    const { issue, oldValue, newValue } = payload;
    this.server.to(`project:${issue.projectId}`).emit('issue_updated', {
      id: issue.id,
      key: issue.key,
      title: issue.title,
      oldValue,
      newValue,
    });
  }

  @OnEvent('sprint.started')
  handleSprintStartedBroadcast(payload: { sprint: any }) {
    const { sprint } = payload;
    this.server
      .to(`project:${sprint.projectId}`)
      .emit('sprint_started', sprint);
  }

  @OnEvent('sprint.completed')
  handleSprintCompletedBroadcast(payload: { sprint: any; velocity: number }) {
    const { sprint, velocity } = payload;
    this.server.to(`project:${sprint.projectId}`).emit('sprint_completed', {
      sprintId: sprint.id,
      name: sprint.name,
      velocity,
    });
  }

  private broadcastPresence(projectId: string) {
    const usersMap = this.presenceMap.get(projectId);
    const userNames = usersMap ? Array.from(usersMap.values()) : [];
    this.server.to(`project:${projectId}`).emit('presence_updated', {
      projectId,
      activeUsers: userNames,
    });
  }
}
