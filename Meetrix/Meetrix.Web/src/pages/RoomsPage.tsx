import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../api/room-service";
import type { Room } from "../models/Room";

const RoomsPage: React.FC = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
        if (data.length > 0) {
          setSelectedRoom(data[0]);
        }
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

  const filteredRooms = rooms.filter((r) =>
    r.roomName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Find a room</h1>
            <p className="page-subtitle">Loading rooms…</p>
          </div>
        </div>
        <div className="admin-card">
          <p>Loading rooms…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Find a room</h1>
            <p className="page-subtitle">Something went wrong.</p>
          </div>
        </div>
        <div className="admin-card">
          <p style={{ color: "#b91c1c" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="page-title">Find a room</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="input-with-label">
            <label>Search rooms</label>
            <input
              type="text"
              placeholder="Search by room name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="input-with-label">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="toolbar-right">
          {/* Future: time range / capacity / accessibility filters */}
        </div>
      </div>

      {/* Main layout: left = rooms, right = schedule */}
      <div className="rooms-layout">
        {/* Left: room cards */}
        <div className="rooms-list-column">
          <div className="admin-card">
            {filteredRooms.length === 0 ? (
              <div className="empty-state">
                <h3>No matching rooms</h3>
                <p>Try a different search term or date.</p>
              </div>
            ) : (
              <div className="room-card-grid">
                {filteredRooms.map((room) => {
                  const isSelected = selectedRoom?.roomId === room.roomId;

                  // Placeholder: will later come from bookings
                  const statusLabel = "Available";
                  const statusClass = "status-pill status-available";

                  return (
                    <button
                      key={room.roomId}
                      type="button"
                      className={
                        "room-card" + (isSelected ? " room-card-selected" : "")
                      }
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="room-card-header">
                        <div>
                          <h3 className="room-card-title">{room.roomName}</h3>
                          <p className="room-card-subtitle">
                            Floor {room.floor ?? 0} · {room.capacity} seats
                          </p>
                        </div>
                        <span className={statusClass}>{statusLabel}</span>
                      </div>

                      <div className="room-card-tags">
                        {room.isAccessible && (
                          <span className="badge badge-success-light">
                            Accessible
                          </span>
                        )}
                      </div>

                      <p className="room-card-description">
                        {room.description || "No description provided."}
                      </p>

                      <div className="room-card-footer">
                        <span className="room-card-footer-text">
                          View schedule & book
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: schedule for selected room (placeholder) */}
        <div className="rooms-side-column">
          <div className="admin-card">
            <h2 className="panel-title">
              {selectedRoom ? selectedRoom.roomName : "Select a room"}
            </h2>
            <p className="panel-subtitle">
              {selectedRoom
                ? `Schedule for ${selectedDate}`
                : "Choose a room from the list to see its schedule."}
            </p>

            {selectedRoom ? (
              <div className="schedule-placeholder">
                <div className="schedule-row schedule-header-row">
                  <span>09:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                  <span>14:00</span>
                  <span>15:00</span>
                </div>
                <div className="schedule-row schedule-body-row">
                  <span className="slot available">Available</span>
                  <span className="slot available">Available</span>
                  <span className="slot busy">Booked</span>
                  <span className="slot available">Available</span>
                  <span className="slot available">Available</span>
                  <span className="slot available">Available</span>
                  <span className="slot available">Available</span>
                </div>

                <div className="schedule-legend">
                  <span className="legend-item">
                    <span className="legend-dot legend-dot-available" /> Available
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot legend-dot-busy" /> Booked
                  </span>
                </div>

                <div className="schedule-actions">
                  <button className="btn-primary" type="button">
                    Book this room
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state small">
                <p>Select a room on the left to see availability and book a slot.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
