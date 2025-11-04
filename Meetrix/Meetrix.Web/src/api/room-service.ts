import type { Room } from "../models/Room";
import api from "./client";

export interface RoomsResponse {
  items: Room[];
}

export async function getRooms(): Promise<any[]> {
  const res = await api.get<RoomsResponse>("/rooms");
  return res.data.items;
}
