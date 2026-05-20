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
exports.IssuesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const issues_service_1 = require("./issues.service");
const issue_dto_1 = require("./dto/issue.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let IssuesController = class IssuesController {
    issuesService;
    constructor(issuesService) {
        this.issuesService = issuesService;
    }
    create(projectId, dto, userId) {
        return this.issuesService.create(projectId, dto, userId);
    }
    findOne(idOrKey) {
        return this.issuesService.findOne(idOrKey);
    }
    update(idOrKey, dto, userId) {
        return this.issuesService.update(idOrKey, dto, userId);
    }
    transition(idOrKey, dto, userId) {
        return this.issuesService.transition(idOrKey, dto, userId);
    }
};
exports.IssuesController = IssuesController;
__decorate([
    (0, common_1.Post)('projects/:projectId/issues'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new issue inside a project' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Issue successfully initialized.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found.' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, issue_dto_1.CreateIssueDto, String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('issues/:idOrKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve an issue by ID or Key (e.g. PROJ-1)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Issue retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Issue not found.' }),
    __param(0, (0, common_1.Param)('idOrKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('issues/:idOrKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an issue (supports optimistic locking via version field)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Issue updated.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Optimistic locking concurrency conflict.' }),
    (0, swagger_1.ApiResponse)({ status: 422, description: 'Workflow validation failed.' }),
    __param(0, (0, common_1.Param)('idOrKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, issue_dto_1.UpdateIssueDto, String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('issues/:idOrKey/transitions'),
    (0, swagger_1.ApiOperation)({ summary: 'Transition an issue status (validates state machine, supports optimistic locking)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Issue status updated.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Optimistic locking concurrency conflict.' }),
    (0, swagger_1.ApiResponse)({ status: 422, description: 'Workflow transition not allowed.' }),
    __param(0, (0, common_1.Param)('idOrKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, issue_dto_1.TransitionIssueDto, String]),
    __metadata("design:returntype", void 0)
], IssuesController.prototype, "transition", null);
exports.IssuesController = IssuesController = __decorate([
    (0, swagger_1.ApiTags)('Issues'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [issues_service_1.IssuesService])
], IssuesController);
//# sourceMappingURL=issues.controller.js.map