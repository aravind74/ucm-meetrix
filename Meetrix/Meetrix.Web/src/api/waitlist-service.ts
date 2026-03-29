import type { Waitlist } from "../models/Waitlist";
import type { WaitlistRequest } from "../models/WaitlistRequest";
import api from "./client";

export async function joinWaitlist(request: WaitlistRequest): Promise<Waitlist> {
  try {
    const response = await api.post("/waitlist", request);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || "Failed to join waitlist.");
  }
}

export async function getMyWaitlist(): Promise<Waitlist[]> {
  const response = await api.get("/waitlist/my");
  return response.data.items ?? [];
}

export async function cancelWaitlist(waitlistId: number): Promise<void> {
  await api.put(`/waitlist/${waitlistId}/cancel`);
}