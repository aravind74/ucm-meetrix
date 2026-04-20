import type { AlternativeRoomsRequest } from "../models/AlternativeRoomRequest";
import type { Room } from "../models/Room";
import api from "./client";

export interface RoomsResponse {
    items: Room[];
}

export async function getRooms(): Promise<any[]> {
    const res = await api.get<RoomsResponse>("/rooms");
    return res.data.items;
}

export const updateRoom = async (room: Room): Promise<void> => {
    await api.put(`/rooms/${room.roomId}`, room);
};

export const createRoom = async (req: Room): Promise<Room> => {
    const res = await api.post<Room>("/rooms", req);
    return res.data;
};

export const deleteRoom = async (roomId: number): Promise<void> => {
    await api.delete(`/rooms/${roomId}`);
};

export const getAlternativeRooms = async (request: AlternativeRoomsRequest): Promise<Room[]> => {
  const response = await api.post("/rooms/alternatives", request);
  return response.data;
};
