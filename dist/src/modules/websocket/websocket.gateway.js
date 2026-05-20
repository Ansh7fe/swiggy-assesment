"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebsocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
let WebsocketGateway = WebsocketGateway_1 = class WebsocketGateway {
    prisma;
    server;
    logger = new common_1.Logger(WebsocketGateway_1.name);
    presenceMap = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    handleConnection(client) {
        this.logger.log(`Socket Client Connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Socket Client Disconnected: ${client.id}`);
        for (const [projectId, users] of this.presenceMap.entries()) {
            if (users.has(client.id)) {
                users.delete(client.id);
                this.broadcastPresence(projectId);
            }
        }
    }
    async handleJoinProject(client, data) {
        const { projectId, userDisplayName } = data;
        if (!projectId)
            return;
        client.join(`project:${projectId}`);
        this.logger.log(`Client ${client.id} joined project room: project:${projectId}`);
        if (!this.presenceMap.has(projectId)) {
            this.presenceMap.set(projectId, new Map());
        }
        this.presenceMap.get(projectId).set(client.id, userDisplayName || `User-${client.id.substring(0, 4)}`);
        this.broadcastPresence(projectId);
    }
    handleLeaveProject(client, data) {
        const { projectId } = data;
        if (!projectId)
            return;
        client.leave(`project:${projectId}`);
        const users = this.presenceMap.get(projectId);
        if (users && users.has(client.id)) {
            users.delete(client.id);
            this.broadcastPresence(projectId);
        }
    }
    async handleSyncEvents(client, data) {
        const { projectId, lastSyncedAt } = data;
        if (!projectId || !lastSyncedAt)
            return;
        const parsedDate = new Date(lastSyncedAt);
        if (isNaN(parsedDate.getTime())) {
            client.emit('sync_error', { message: 'Invalid ISO date string provided for sync.' });
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
            this.logger.log(`Replayed ${missedEvents.length} events to client ${client.id}`);
        }
        catch (err) {
            this.logger.error(`Error in event replay sync: ${err.message}`);
        }
    }
    handleIssueCreatedBroadcast(payload) {
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
    handleIssueUpdatedBroadcast(payload) {
        const { issue, oldValue, newValue } = payload;
        this.server.to(`project:${issue.projectId}`).emit('issue_updated', {
            id: issue.id,
            key: issue.key,
            title: issue.title,
            oldValue,
            newValue,
        });
    }
    handleSprintStartedBroadcast(payload) {
        const { sprint } = payload;
        this.server.to(`project:${sprint.projectId}`).emit('sprint_started', sprint);
    }
    handleSprintCompletedBroadcast(payload) {
        const { sprint, velocity } = payload;
        this.server.to(`project:${sprint.projectId}`).emit('sprint_completed', {
            sprintId: sprint.id,
            name: sprint.name,
            velocity,
        });
    }
    broadcastPresence(projectId) {
        const usersMap = this.presenceMap.get(projectId);
        const userNames = usersMap ? Array.from(usersMap.values()) : [];
        this.server.to(`project:${projectId}`).emit('presence_updated', {
            projectId,
            activeUsers: userNames,
        });
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleJoinProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleLeaveProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sync_events'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleSyncEvents", null);
__decorate([
    (0, event_emitter_1.OnEvent)('issue.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleIssueCreatedBroadcast", null);
__decorate([
    (0, event_emitter_1.OnEvent)('issue.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleIssueUpdatedBroadcast", null);
__decorate([
    (0, event_emitter_1.OnEvent)('sprint.started'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleSprintStartedBroadcast", null);
__decorate([
    (0, event_emitter_1.OnEvent)('sprint.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebsocketGateway.prototype, "handleSprintCompletedBroadcast", null);
exports.WebsocketGateway = WebsocketGateway = WebsocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map