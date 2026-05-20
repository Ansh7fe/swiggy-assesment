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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_service_1 = require("./search.service");
let SearchController = class SearchController {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    search(q, projectId, status, assigneeId, priority, limit, cursor) {
        const parsedLimit = limit ? parseInt(limit, 10) : 20;
        return this.searchService.searchIssues({
            q,
            projectId,
            status,
            assigneeId,
            priority,
            limit: parsedLimit,
            cursor,
        });
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Full-text query search with structured filters and cursor pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, type: String, description: 'Text search query for title/description' }),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: false, type: String, description: 'Filter by Project UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, description: 'Filter by Workflow status' }),
    (0, swagger_1.ApiQuery)({ name: 'assigneeId', required: false, type: String, description: 'Filter by Assignee UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, type: String, description: 'Filter by Priority level' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Max records (default: 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'cursor', required: false, type: String, description: 'ISO date timestamp cursor of last retrieved issue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search matches retrieved successfully.' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('assigneeId')),
    __param(4, (0, common_1.Query)('priority')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SearchController.prototype, "search", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('Search'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map