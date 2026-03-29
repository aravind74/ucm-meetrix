export interface AvailabilityWindow {
  startTime: string;   // ISO string
  endTime: string;     // ISO string
  isAvailable: boolean;
  bookedByUserId?: number | null;
}

export interface RoomAvailabilityResponse {
  roomId: number;
  date: string;        // ISO date string
  windows: AvailabilityWindow[];
}