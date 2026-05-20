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
exports.SetCustomFieldValueDto = exports.CreateCustomFieldDto = exports.CustomFieldType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var CustomFieldType;
(function (CustomFieldType) {
    CustomFieldType["TEXT"] = "TEXT";
    CustomFieldType["DROPDOWN"] = "DROPDOWN";
})(CustomFieldType || (exports.CustomFieldType = CustomFieldType = {}));
class CreateCustomFieldDto {
    name;
    type;
    config;
}
exports.CreateCustomFieldDto = CreateCustomFieldDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SDE Level Required', description: 'Name of the custom field' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCustomFieldDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CustomFieldType, example: 'DROPDOWN', description: 'Field type classification' }),
    (0, class_validator_1.IsEnum)(CustomFieldType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCustomFieldDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['SDE-1', 'SDE-2', 'SDE-3'], description: 'Dropdown options config (mandatory for DROPDOWN)', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCustomFieldDto.prototype, "config", void 0);
class SetCustomFieldValueDto {
    fieldId;
    value;
}
exports.SetCustomFieldValueDto = SetCustomFieldValueDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-custom-field-id', description: 'ID of the custom field' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetCustomFieldValueDto.prototype, "fieldId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SDE-1', description: 'Value to record for the issue custom field' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], SetCustomFieldValueDto.prototype, "value", void 0);
//# sourceMappingURL=fields.dto.js.map