export interface Booking {
  bookingId: number;
  userId?: number;
  userName?: string | null;
  roomId: number;
  roomName: string;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
  purpose?: string | null;
  lastUpdated?: string | null;
  checkedInAt?: string | null;
}