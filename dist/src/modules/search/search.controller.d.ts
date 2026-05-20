import { SearchService } from './search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    search(q?: string, projectId?: string, status?: string, assigneeId?: string, priority?: string, limit?: string, cursor?: string): Promise<{
        issues: any[];
        nextCursor: any;
    }>;
}
