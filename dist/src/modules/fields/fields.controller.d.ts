import { FieldsService } from './fields.service';
import { CreateCustomFieldDto, SetCustomFieldValueDto } from './dto/fields.dto';
export declare class FieldsController {
    private fieldsService;
    constructor(fieldsService: FieldsService);
    createCustomField(projectId: string, dto: CreateCustomFieldDto): Promise<{
        type: string;
        id: string;
        name: string;
        projectId: string;
        config: import("@prisma/client/runtime/client").JsonValue;
    }>;
    setCustomFieldValue(issueId: string, dto: SetCustomFieldValueDto): Promise<{
        issueId: string;
        fieldId: string;
        value: import("@prisma/client/runtime/client").JsonValue;
    }>;
    addWatcher(issueId: string, userId: string): Promise<{
        issueId: string;
        userId: string;
    }>;
    removeWatcher(issueId: string, userId: string): Promise<{
        message: string;
    }>;
}
