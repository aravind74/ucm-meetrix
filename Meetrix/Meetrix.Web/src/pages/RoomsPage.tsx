import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // if you created this earlier
import type { Room } from "../models/Room";
import { getRooms } from "../api/room-service";
import RoomsList from "../components/RoomList";

const RoomsPage: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err: any) {
        console.error("Failed to load rooms", err);
        if (err.response?.status === 401) {
          setError("Not authorized. Please login again.");
        } else {
          setError("Failed to load rooms.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        <h1>Meeting Rooms</h1>
        <div>
          <span style={{ marginRight: 12 }}>
            {auth.fullName ?? auth.email}
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <RoomsList rooms={rooms} />
    </div>
  );
};

export default RoomsPage;
