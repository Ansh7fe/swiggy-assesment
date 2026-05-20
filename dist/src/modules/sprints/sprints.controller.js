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
exports.SprintsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sprints_service_1 = require("./sprints.service");
const sprint_dto_1 = require("./dto/sprint.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SprintsController = class SprintsController {
    sprintsService;
    constructor(sprintsService) {
        this.sprintsService = sprintsService;
    }
    create(projectId, dto) {
        return this.sprintsService.create(projectId, dto);
    }
    start(id, dto, userId) {
        return this.sprintsService.start(id, dto, userId);
    }
    complete(id, dto, userId) {
        return this.sprintsService.complete(id, dto, userId);
    }
    findProjectSprints(projectId) {
        return this.sprintsService.findProjectSprints(projectId);
    }
};
exports.SprintsController = SprintsController;
__decorate([
    (0, common_1.Post)('projects/:projectId/sprints'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new sprint in PLANNING stage' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sprint successfully initialized.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found.' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sprint_dto_1.CreateSprintDto]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('sprints/:id/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a planning sprint (asserts no other active sprints exist)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sprint started successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Another sprint is already active.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sprint_dto_1.StartSprintDto, String]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)('sprints/:id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete an active sprint, calculating velocity and managing carry-overs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sprint completed. Velocity calculated.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Sprint is not currently active.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sprint_dto_1.CompleteSprintDto, String]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "complete", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/sprints'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of all sprints in a project' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sprints list retrieved.' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "findProjectSprints", null);
exports.SprintsController = SprintsController = __decorate([
    (0, swagger_1.ApiTags)('Sprints'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [sprints_service_1.SprintsService])
], SprintsController);
//# sourceMappingURL=sprints.controller.js.map