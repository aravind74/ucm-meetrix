import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getRooms } from "../api/room-service";
import type { Room } from "../models/Room";

const AdminRoomsPage: React.FC = () => {
  useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const filteredRooms = rooms.filter((r) =>
    r.roomName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Rooms</h1>
            <p className="page-subtitle">Manage all meeting spaces.</p>
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
            <h1 className="page-title">Rooms</h1>
            <p className="page-subtitle">Manage all meeting spaces.</p>
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
          <h1 className="page-title">Rooms</h1>
          <p className="page-subtitle">
            Create, update, and manage meeting rooms across your workspace.
          </p>
        </div>

        <div className="admin-header-actions">
          {/* Placeholder for future import/export/etc */}
          {/* <button className="btn-ghost">Export</button> */}
          <button className="btn-primary">
            + Add Room
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="input-with-label">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by room name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <div className="input-inline">
            <label>Accessibility</label>
            <select>
              <option value="all">All</option>
              <option value="accessible">Accessible</option>
              <option value="standard">Standard</option>
            </select>
          </div>
          <div className="input-inline">
            <label>Capacity</label>
            <select>
              <option value="any">Any</option>
              <option value="small">1–4</option>
              <option value="medium">5–10</option>
              <option value="large">11+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="admin-card">
        {filteredRooms.length === 0 ? (
          <div className="empty-state">
            <h3>No rooms found</h3>
            <p>
              Try adjusting your search, or add a new room to get started.
            </p>
            <button className="btn-primary btn-sm">
              + Add Room
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Capacity</th>
                  <th>Accessibility</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((r) => (
                  <tr key={r.roomId}>
                    <td>
                      <div className="room-name-cell">
                        <span className="room-name">{r.roomName}</span>
                        {/* Placeholder: floor / building / code */}
                        {/* <span className="room-meta">Floor 3 • West Wing</span> */}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-muted">
                        {r.capacity} seats
                      </span>
                    </td>
                    <td>
                      {r.isAccessible ? (
                        <span className="badge badge-success">
                          Accessible
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          Standard
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-ghost btn-xs"
                        // onClick={() => openEdit(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger btn-xs"
                        style={{ marginLeft: 8 }}
                        // onClick={() => confirmDelete(r)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoomsPage;
