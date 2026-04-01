export interface Room {
    roomId: number;
    roomName: string;
    capacity: number;
    floor: number;
    description: string;
    isAccessible: boolean;
    facilities: string[];
  }