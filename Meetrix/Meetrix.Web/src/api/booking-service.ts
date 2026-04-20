import type { Booking } from "../models/Booking";
import type { BookingRequest } from "../models/BookingRequest";
import type { RoomAvailabilityResponse } from "../models/RoomAvailabilityResponse";
import api from "./client";

export async function getMyBookings(): Promise<Booking[]> {
  const response = await api.get("/bookings/my");
  return response.data.items ?? [];
}

export async function cancelBooking(bookingId: number): Promise<void> {
  await api.put(`/bookings/${bookingId}/cancel`);
}

export async function createBooking(request: BookingRequest): Promise<Booking> {
  try {
    const response = await api.post("/bookings", request);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error(
        error.response.data || "This room is already booked for the selected time."
      );
    }

    throw new Error(
      error.response?.data || "Failed to create booking."
    );
  }
}

export async function getRoomAvailability(roomId: number, date: string): Promise<RoomAvailabilityResponse> {
  const response = await api.get("/bookings/availability", {params: { roomId, date },});
  return response.data;
}

export async function getCurrentBookingsAdmin(): Promise<Booking[]> {
  const response = await api.get("/admin/bookings/current");
  return response.data.items ?? [];
}

export async function getBookingHistoryAdmin(): Promise<Booking[]> {
  const response = await api.get("/admin/bookings/history");
  return response.data.items ?? [];
}

export async function getCancelledBookingsAdmin(): Promise<Booking[]> {
  const response = await api.get("/admin/bookings/cancelled");
  return response.data.items ?? [];
}

export async function checkInBooking(bookingId: number): Promise<void> {
  await api.post(`/bookings/${bookingId}/check-in`);
}

export async function cancelAndReassign(bookingId: number): Promise<Booking> {
  const response = await api.post(`/admin/bookings/${bookingId}/cancelandreassign`);
  return response.data.items.result;
}