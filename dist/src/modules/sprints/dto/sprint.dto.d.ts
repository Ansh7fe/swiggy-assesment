export declare class CreateSprintDto {
    name: string;
    goal?: string;
}
export declare class StartSprintDto {
    startDate: string;
    endDate: string;
}
export declare class CompleteSprintDto {
    carryOverSprintId?: string;
    carryOverIssueIds?: string[];
}
