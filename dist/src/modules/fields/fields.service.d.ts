import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomFieldDto, SetCustomFieldValueDto } from './dto/fields.dto';
export declare class FieldsService {
    private prisma;
    constructor(prisma: PrismaService);
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
