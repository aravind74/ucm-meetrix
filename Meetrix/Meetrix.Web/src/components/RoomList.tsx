import React from "react";
import type { Room } from "../models/Room";

interface RoomsListProps {
  rooms: Room[];
}

const RoomsList: React.FC<RoomsListProps> = ({ rooms }) => {
  if (rooms.length === 0) {
    return <p>No rooms found.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {rooms.map((room) => (
        <li
          key={room.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>{room.roomName}</strong>
            <div>Capacity: {room.capacity}</div>
            {room.isAccessible && (
              <div style={{ fontSize: 12, color: "green" }}>Accessible</div>
            )}
          </div>
          {/* Placeholder for future actions: Book, View, Favorite */}
          <div>
            <button>Book</button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RoomsList;
