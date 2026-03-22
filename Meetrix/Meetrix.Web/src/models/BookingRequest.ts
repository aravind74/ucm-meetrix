export interface BookingRequest {
  roomId: number;
  startTime: string;
  endTime: string;
  purpose?: string;
}