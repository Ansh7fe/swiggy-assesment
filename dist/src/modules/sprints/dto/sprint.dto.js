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
exports.CompleteSprintDto = exports.StartSprintDto = exports.CreateSprintDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSprintDto {
    name;
    goal;
}
exports.CreateSprintDto = CreateSprintDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sprint 1 - Core Services', description: 'Sprint title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSprintDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Setup login auth and core issue flows', description: 'Sprint goal text', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSprintDto.prototype, "goal", void 0);
class StartSprintDto {
    startDate;
    endDate;
}
exports.StartSprintDto = StartSprintDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-20T12:00:00.000Z', description: 'Sprint start date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartSprintDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-06-03T12:00:00.000Z', description: 'Sprint target end date' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartSprintDto.prototype, "endDate", void 0);
class CompleteSprintDto {
    carryOverSprintId;
    carryOverIssueIds;
}
exports.CompleteSprintDto = CompleteSprintDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-next-sprint-id', description: 'Sprint ID to carry incomplete issues over to', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompleteSprintDto.prototype, "carryOverSprintId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['uuid-issue-1', 'uuid-issue-2'], description: 'List of specific issues to carry over (if omitted, all incomplete issues are carried over or backlogged)', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CompleteSprintDto.prototype, "carryOverIssueIds", void 0);
//# sourceMappingURL=sprint.dto.js.map