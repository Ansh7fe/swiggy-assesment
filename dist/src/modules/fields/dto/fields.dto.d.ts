export declare enum CustomFieldType {
    TEXT = "TEXT",
    DROPDOWN = "DROPDOWN"
}
export declare class CreateCustomFieldDto {
    name: string;
    type: CustomFieldType;
    config?: string[];
}
export declare class SetCustomFieldValueDto {
    fieldId: string;
    value: any;
}
