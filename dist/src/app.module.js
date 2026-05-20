"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const projects_module_1 = require("./modules/projects/projects.module");
const issues_module_1 = require("./modules/issues/issues.module");
const workflow_module_1 = require("./modules/workflow/workflow.module");
const sprints_module_1 = require("./modules/sprints/sprints.module");
const activity_module_1 = require("./modules/activity/activity.module");
const search_module_1 = require("./modules/search/search.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const comments_module_1 = require("./modules/comments/comments.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const fields_module_1 = require("./modules/fields/fields.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            issues_module_1.IssuesModule,
            workflow_module_1.WorkflowModule,
            sprints_module_1.SprintsModule,
            activity_module_1.ActivityModule,
            search_module_1.SearchModule,
            websocket_module_1.WebsocketModule,
            comments_module_1.CommentsModule,
            notifications_module_1.NotificationsModule,
            fields_module_1.FieldsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map