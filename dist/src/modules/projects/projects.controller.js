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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("./projects.service");
const project_dto_1 = require("./dto/project.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    create(dto, userId) {
        return this.projectsService.create(dto, userId);
    }
    findAll() {
        return this.projectsService.findAll();
    }
    findOne(idOrKey) {
        return this.projectsService.findOne(idOrKey);
    }
    getBoard(idOrKey) {
        return this.projectsService.getBoard(idOrKey);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project with key and standard workflow seed' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Project successfully initialized with workflow.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Project key already taken.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectDto, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all projects' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Projects list retrieved.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':idOrKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve project by Key or ID, including workflow structure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project details retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found.' }),
    __param(0, (0, common_1.Param)('idOrKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':idOrKey/board'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve the project board columns and issues' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Board columns and issues retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found.' }),
    __param(0, (0, common_1.Param)('idOrKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getBoard", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map