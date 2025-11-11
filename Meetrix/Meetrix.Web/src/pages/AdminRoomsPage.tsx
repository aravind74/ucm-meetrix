import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getRooms, updateRoom, deleteRoom } from "../api/room-service";
import type { Room } from "../models/Room";

const AdminRoomsPage: React.FC = () => {
    useAuth();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [accessFilter, setAccessFilter] = useState<"all" | "accessible" | "standard">(
        "all"
    );
    const [capacityFilter, setCapacityFilter] = useState<
        "any" | "small" | "medium" | "large"
    >("any");


    // edit modal statec
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [editName, setEditName] = useState("");
    const [editCapacity, setEditCapacity] = useState<number>(0);
    const [editFloor, setEditFloor] = useState<number>(0);
    const [editAccessible, setEditAccessible] = useState(false);
    const [saving, setSaving] = useState(false);

    // delete confirm state
    const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
    const [deleting, setDeleting] = useState(false);

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

    const openEdit = (room: Room) => {
        setEditingRoom(room);
        setEditName(room.roomName);
        setEditCapacity(room.capacity);
        setEditFloor(room.floor);
        setEditAccessible(room.isAccessible);
    };

    const closeEdit = () => {
        if (saving) return;
        setEditingRoom(null);
    };

    const handleSaveEdit = async () => {
        if (!editingRoom) return;
        if (!editName.trim()) {
            alert("Room name is required.");
            return;
        }
        if (editCapacity <= 0) {
            alert("Capacity must be greater than zero.");
            return;
        }

        try {
            setSaving(true);
            await updateRoom({
                roomId: editingRoom.roomId,
                roomName: editName.trim(),
                capacity: editCapacity,
                floor: editFloor,
                isAccessible: editAccessible,
            });

            // Update local state
            setRooms((prev) =>
                prev.map((r) =>
                    r.roomId === editingRoom.roomId
                        ? {
                            ...r,
                            roomName: editName.trim(),
                            capacity: editCapacity,
                            isAccessible: editAccessible,
                        }
                        : r
                )
            );

            closeEdit();
        } catch (err: any) {
            console.error(err);
            alert("Failed to update room.");
        } finally {
            setSaving(false);
        }
    };

    const openDeleteConfirm = (room: Room) => {
        setDeleteTarget(room);
    };

    const closeDeleteConfirm = () => {
        if (deleting) return;
        setDeleteTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await deleteRoom(deleteTarget.roomId);
            setRooms((prev) => prev.filter((r) => r.roomId !== deleteTarget.roomId));
            closeDeleteConfirm();
        } catch (err: any) {
            console.error(err);
            alert("Failed to delete room.");
        } finally {
            setDeleting(false);
        }
    };

    const filteredRooms = rooms.filter((r) => {
        // search
        if (!r.roomName.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
      
        // accessibility filter
        if (accessFilter === "accessible" && !r.isAccessible) return false;
        if (accessFilter === "standard" && r.isAccessible) return false;
      
        // capacity filter
        if (capacityFilter === "small" && !(r.capacity >= 1 && r.capacity <= 4))
          return false;
        if (capacityFilter === "medium" && !(r.capacity >= 5 && r.capacity <= 10))
          return false;
        if (capacityFilter === "large" && !(r.capacity >= 11))
          return false;
      
        return true;
      });
      

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
                        <select value={accessFilter}
                            onChange={(e) =>
                                setAccessFilter(e.target.value as "all" | "accessible" | "standard")
                            }>
                            <option value="all">All</option>
                            <option value="accessible">Accessible</option>
                            <option value="standard">Standard</option>
                        </select>
                    </div>
                    <div className="input-inline">
                        <label>Capacity</label>
                        <select value={capacityFilter}
                            onChange={(e) =>
                                setCapacityFilter(
                                    e.target.value as "any" | "small" | "medium" | "large"
                                )
                            }>
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
                        <p>Try adjusting your search, or add a new room to get started.</p>
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
                                                onClick={() => openEdit(r)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn-danger btn-xs"
                                                style={{ marginLeft: 8 }}
                                                onClick={() => openDeleteConfirm(r)}
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

            {/* Edit Room Modal */}
            {editingRoom && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <h2 className="modal-title">Edit room</h2>
                        <p className="modal-subtitle">
                            Update basic details for <strong>{editingRoom.roomName}</strong>.
                        </p>

                        <div className="modal-body">
                            <div className="form-field">
                                <label>Room name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <label>Capacity</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={editCapacity}
                                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                                />
                            </div>

                            <div className="form-field">
                                <label>Floor</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={editFloor}
                                    onChange={(e) => setEditFloor(Number(e.target.value))}
                                />
                            </div>

                            <div className="form-field form-field-inline">
                                <label>Accessibility</label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={editAccessible}
                                        onChange={(e) => setEditAccessible(e.target.checked)}
                                    />
                                    <span>Accessible room</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-ghost"
                                onClick={closeEdit}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSaveEdit}
                                disabled={saving}
                            >
                                {saving ? "Saving…" : "Save changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm dialog */}
            {deleteTarget && (
                <div className="modal-backdrop">
                    <div className="modal-card small">
                        <h2 className="modal-title">Delete room</h2>
                        <p className="modal-subtitle">
                            Are you sure you want to delete{" "}
                            <strong>{deleteTarget.roomName}</strong>? This action cannot be
                            undone.
                        </p>

                        <div className="modal-footer">
                            <button
                                className="btn-ghost"
                                onClick={closeDeleteConfirm}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRoomsPage;
