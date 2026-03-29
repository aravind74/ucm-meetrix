export interface Waitlist {
    waitlistId: number;
    userId: number;
    roomId: number;
    roomName: string;
    startTime: string;
    endTime: string;
    status: string;
    createdOn: string;
    lastUpdated: string | null;
}