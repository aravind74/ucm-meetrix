import React, { useEffect, useMemo, useState } from "react";
import { cancelWaitlist, getMyWaitlist } from "../api/waitlist-service";
import type { Waitlist } from "../models/Waitlist";

const MyWaitlistPage: React.FC = () => {
  const [entries, setEntries] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    loadWaitlist();
  }, []);

  const loadWaitlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyWaitlist();
      setEntries(data);
    } catch (err: any) {
      console.error("Failed to load waitlist", err);
      setError(err?.message || "Failed to load waitlist.");
    } finally {
      setLoading(false);
    }
  };

  const activeEntries = useMemo(() => {
    return entries
      .filter((entry) => (entry.status ?? "").toLowerCase() !== "cancelled" && (entry.status ?? "").toLowerCase() !== "expired")
      .sort((a, b) => {
        const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
        return aTime - bTime;
      });
  }, [entries]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status?: string | null) => {
    switch ((status ?? "").toLowerCase()) {
      case "active":
        return "status-pill scheduled";
      case "assigned":
        return "status-pill checked-in";
      case "cancelled":
        return "status-pill cancelled";
      default:
        return "status-pill";
    }
  };

  const handleCancel = async (waitlistId: number) => {
    try {
      setCancellingId(waitlistId);
      await cancelWaitlist(waitlistId);
      await loadWaitlist();
    } catch (err: any) {
      console.error("Failed to cancel waitlist", err);
      setError(err?.message || "Failed to cancel waitlist.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">My Waitlist</h1>
          <p className="page-subtitle">
            Track rooms and time slots you are waiting for.
          </p>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="empty-state">
            <h3>Loading waitlist...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Could not load waitlist</h3>
            <p>{error}</p>
          </div>
        ) : activeEntries.length === 0 ? (
          <div className="empty-state">
            <h3>No waitlist entries</h3>
            <p>You have not joined any waitlist yet.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {activeEntries.map((entry) => (
              <div key={entry.waitlistId} className="booking-item">
                <div className="booking-item-left">
                  <div className="booking-title-row">
                    <h3 className="booking-room-name">{entry.roomName}</h3>
                    <span className={getStatusClass(entry.status)}>
                      {entry.status ?? "Unknown"}
                    </span>
                  </div>

                  <p className="booking-time">
                    <strong>Start:</strong> {formatDateTime(entry.startTime)}
                  </p>

                  <p className="booking-time">
                    <strong>End:</strong> {formatDateTime(entry.endTime)}
                  </p>

                  <p className="booking-time">
                    <strong>Requested On:</strong> {formatDateTime(entry.createdOn)}
                  </p>
                </div>

                {(entry.status ?? "").toLowerCase() === "active" && (
                  <div className="booking-item-right">
                    <button
                      type="button"
                      className="btn-danger btn-sm"
                      onClick={() => handleCancel(entry.waitlistId)}
                      disabled={cancellingId === entry.waitlistId}
                    >
                      {cancellingId === entry.waitlistId ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWaitlistPage;