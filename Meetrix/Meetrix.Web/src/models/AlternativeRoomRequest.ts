export interface AlternativeRoomsRequest {
    excludeRoomId: number;
    startTime: string;
    endTime: string;
    accessFilter: "all" | "accessible" | "standard";
    capacityFilter: "any" | "small" | "medium" | "large";
    facilities: string[];
}