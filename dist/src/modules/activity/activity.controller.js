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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_service_1 = require("./activity.service");
let ActivityController = class ActivityController {
    activityService;
    constructor(activityService) {
        this.activityService = activityService;
    }
    findProjectActivity(projectId, limit, cursor) {
        const parsedLimit = limit ? parseInt(limit, 10) : 50;
        return this.activityService.findProjectActivity(projectId, parsedLimit, cursor);
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs and activity history for a project' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of logs to fetch (default: 50)' }),
    (0, swagger_1.ApiQuery)({ name: 'cursor', required: false, type: String, description: 'Cursor ID for pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity logs retrieved successfully.' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "findProjectActivity", null);
exports.ActivityController = ActivityController = __decorate([
    (0, swagger_1.ApiTags)('Activity'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('projects/:projectId/activity'),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map