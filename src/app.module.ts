import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { IssuesModule } from './modules/issues/issues.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { SprintsModule } from './modules/sprints/sprints.module';
import { ActivityModule } from './modules/activity/activity.module';
import { SearchModule } from './modules/search/search.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { CommentsModule } from './modules/comments/comments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FieldsModule } from './modules/fields/fields.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    // Register Nest Event Emitter globally
    EventEmitterModule.forRoot(),
    
    // Core database service module
    PrismaModule,
    
    // Feature Modules
    AuthModule,
    ProjectsModule,
    IssuesModule,
    WorkflowModule,
    SprintsModule,
    ActivityModule,
    SearchModule,
    WebsocketModule,
    CommentsModule,
    NotificationsModule,
    FieldsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Bind JWT Auth Guard globally to secure all endpoints by default
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
