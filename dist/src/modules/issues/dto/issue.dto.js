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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionIssueDto = exports.UpdateIssueDto = exports.CreateIssueDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateIssueDto {
    type;
    title;
    description;
    priority;
    assigneeId;
    sprintId;
    storyPoints;
    parentId;
    labels;
}
exports.CreateIssueDto = CreateIssueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.IssueType, example: 'TASK', description: 'Issue type classification' }),
    (0, class_validator_1.IsEnum)(client_1.IssueType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIssueDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Implement auth gateway', description: 'Issue title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIssueDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Implement passport jwt strategy', description: 'Detailed description', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIssueDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.IssuePriority, example: 'MEDIUM', description: 'Issue priority scale' }),
    (0, class_validator_1.IsEnum)(client_1.IssuePriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIssueDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-user-id', description: 'Assignee user ID', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIssueDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-sprint-id', description: 'Sprint ID', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIssueDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Story points estimate', required: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateIssueDto.prototype, "storyPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-parent-issue-id', description: 'Parent issue ID (for sub-tasks)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIssueDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['backend', 'security'], description: 'List of tags/labels', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateIssueDto.prototype, "labels", void 0);
class UpdateIssueDto {
    type;
    title;
    description;
    priority;
    assigneeId;
    sprintId;
    storyPoints;
    status;
    version;
    labels;
}
exports.UpdateIssueDto = UpdateIssueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.IssueType, required: false }),
    (0, class_validator_1.IsEnum)(client_1.IssueType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIssueDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIssueDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIssueDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.IssuePriority, required: false }),
    (0, class_validator_1.IsEnum)(client_1.IssuePriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIssueDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIssueDto.prototype, "assigneeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIssueDto.prototype, "sprintId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateIssueDto.prototype, "storyPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIssueDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Current issue version (mandatory for optimistic lock validation)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], UpdateIssueDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['backend'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateIssueDto.prototype, "labels", void 0);
class TransitionIssueDto {
    status;
    version;
}
exports.TransitionIssueDto = TransitionIssueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'IN_PROGRESS', description: 'Target workflow status name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransitionIssueDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Current issue version (mandatory for optimistic lock validation)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], TransitionIssueDto.prototype, "version", void 0);
//# sourceMappingURL=issue.dto.js.map