import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getRooms } from "../api/room-service";
import type { Room } from "../models/Room";

const AdminRoomsPage: React.FC = () => {
  useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <div style={{ marginBottom: 16 }}>
        <button /* onClick={openCreateModal} */>+ Add Room</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Name</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Capacity</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Accessible</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.roomId}>
              <td style={{ padding: "6px 0" }}>{r.roomName}</td>
              <td>{r.capacity}</td>
              <td>{r.isAccessible ? "Yes" : "No"}</td>
              <td>
                <button style={{ marginRight: 8 }}>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRoomsPage;
