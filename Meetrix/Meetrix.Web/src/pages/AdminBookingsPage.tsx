import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import type { Booking } from "../models/Booking";
import { useToast } from "../components/ToastContext";
import { cancelAndReassign, getBookingHistoryAdmin, getCancelledBookingsAdmin, getCurrentBookingsAdmin } from "../api/booking-service";

const AdminBookingsPage: React.FC = () => {
  useAuth();

  const { showToast } = useToast();

  const [tab, setTab] = useState<"current" | "history" | "cancelled">("current");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: Booking[] = [];

        if (tab === "current") {
          data = await getCurrentBookingsAdmin();
        } else if (tab === "history") {
          data = await getBookingHistoryAdmin();
        } else {
          data = await getCancelledBookingsAdmin();
        }

        setBookings(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings.");
        showToast("Failed to load bookings.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [tab, showToast]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;

    return bookings.filter((b) => {
      return (
        b.roomName.toLowerCase().includes(query) ||
        (b.purpose ?? "").toLowerCase().includes(query) ||
        (b.status ?? "").toLowerCase().includes(query) ||
        String(b.bookingId).includes(query) ||
        String(b.userId).includes(query)
      );
    });
  }, [bookings, search]);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "—";

    const date = new Date(value);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status?: string | null) => {
    switch ((status ?? "").toLowerCase()) {
      case "scheduled":
        return "badge badge-neutral";
      case "cancelled":
        return "badge badge-danger-soft";
      case "completed":
        return "badge badge-success";
      case "inprogress":
      case "in progress":
        return "badge badge-warning-soft";
      default:
        return "badge badge-muted";
    }
  };

  const handleCancelAndReassign = (booking: Booking) => {
    cancelAndReassign(booking.bookingId)
      .then((updatedBooking) => {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === booking.bookingId ? updatedBooking : b))
        );
        if(updatedBooking.message) {
          showToast(`${updatedBooking.message}`, "info");
        } else {
          showToast(`Booking cancelled and reassigned successfully.`, "success");
        }
      })
      .catch((err) => {
        console.error(err);
        showToast(`Failed to cancel and reassign booking.`, "error");
      });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Bookings</h1>
            <p className="page-subtitle">Manage and monitor all bookings.</p>
          </div>
        </div>
        <div className="admin-card">
          <p>Loading bookings…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Bookings</h1>
            <p className="page-subtitle">Manage and monitor all bookings.</p>
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
      <div className="admin-header">
        <div>
          <h1 className="page-title">Bookings</h1>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="tabs">
            <button
              className={`tab-btn ${tab === "current" ? "active" : ""}`}
              onClick={() => setTab("current")}
              type="button"
            >
              Current
            </button>
            <button
              className={`tab-btn ${tab === "history" ? "active" : ""}`}
              onClick={() => setTab("history")}
              type="button"
            >
              History
            </button>
            <button
              className={`tab-btn ${tab === "cancelled" ? "active" : ""}`}
              onClick={() => setTab("cancelled")}
              type="button"
            >
              Cancelled/No-Show
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="input-with-label">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by room, purpose, user id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings found</h3>
            <p>There are no bookings to display for this tab right now.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Employee Name</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  {tab === "current" && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.bookingId}>
                    <td>
                      <div className="room-name-cell">
                        <span className="room-name">{b.roomName}</span>
                      </div>
                    </td>
                    <td>
                      <span>{b.userName}</span>
                    </td>
                    <td>{formatDateTime(b.startTime)}</td>
                    <td>{formatDateTime(b.endTime)}</td>
                    <td>
                      <span className="room-description">{b.purpose || "—"}</span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(b.status)}>
                        {b.status || "—"}
                      </span>
                    </td>
                    {tab === "current" && (
                      <td>
                        <button
                          className="btn-ghost btn-xs"
                          onClick={() => handleCancelAndReassign(b)}
                          type="button"
                          disabled={b.status?.toLowerCase() === "noshow"}
                        >
                          Cancel and Reassign
                        </button>
                      </td>
                    )}
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

export default AdminBookingsPage;