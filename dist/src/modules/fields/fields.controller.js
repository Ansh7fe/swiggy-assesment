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
exports.FieldsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fields_service_1 = require("./fields.service");
const fields_dto_1 = require("./dto/fields.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FieldsController = class FieldsController {
    fieldsService;
    constructor(fieldsService) {
        this.fieldsService = fieldsService;
    }
    createCustomField(projectId, dto) {
        return this.fieldsService.createCustomField(projectId, dto);
    }
    setCustomFieldValue(issueId, dto) {
        return this.fieldsService.setCustomFieldValue(issueId, dto);
    }
    addWatcher(issueId, userId) {
        return this.fieldsService.addWatcher(issueId, userId);
    }
    removeWatcher(issueId, userId) {
        return this.fieldsService.removeWatcher(issueId, userId);
    }
};
exports.FieldsController = FieldsController;
__decorate([
    (0, common_1.Post)('projects/:projectId/custom-fields'),
    (0, swagger_1.ApiOperation)({ summary: 'Define a custom field (TEXT or DROPDOWN) for a project' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Custom field registered successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation errors (e.g. missing dropdown options).' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, fields_dto_1.CreateCustomFieldDto]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "createCustomField", null);
__decorate([
    (0, common_1.Post)('issues/:issueId/custom-fields'),
    (0, swagger_1.ApiOperation)({ summary: 'Record/update custom field value on an issue' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Field value successfully updated.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation errors (e.g. value not in dropdown config).' }),
    __param(0, (0, common_1.Param)('issueId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, fields_dto_1.SetCustomFieldValueDto]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "setCustomFieldValue", null);
__decorate([
    (0, common_1.Post)('issues/:issueId/watch'),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to watch an issue' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subscribed as watcher.' }),
    __param(0, (0, common_1.Param)('issueId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "addWatcher", null);
__decorate([
    (0, common_1.Delete)('issues/:issueId/watch'),
    (0, swagger_1.ApiOperation)({ summary: 'Unsubscribe from watching an issue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Watcher removed.' }),
    __param(0, (0, common_1.Param)('issueId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "removeWatcher", null);
exports.FieldsController = FieldsController = __decorate([
    (0, swagger_1.ApiTags)('Custom Fields & Watchers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [fields_service_1.FieldsService])
], FieldsController);
//# sourceMappingURL=fields.controller.js.map