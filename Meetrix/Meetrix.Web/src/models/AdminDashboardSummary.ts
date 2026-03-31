export interface RoomUsage {
  roomId: number;
  roomName: string;
  bookingCount: number;
}

export interface HourlyBooking {
  hour: number;
  bookingCount: number;
}

export interface AdminDashboardSummary {
  totalBookings: number;
  currentBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  totalRooms: number;
  activeWaitlistEntries: number;
  topRooms: RoomUsage[];
  peakHours: HourlyBooking[];
}