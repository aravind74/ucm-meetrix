import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cancelBooking, checkInBooking, getMyBookings } from "../api/booking-service";
import type { Booking } from "../models/Booking";

const MyBookingsPage: React.FC = () => {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);

  const [searchParams] = useSearchParams();
  const highlightedBookingId = Number(searchParams.get("checkInBookingId"));
  const bookingRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (highlightedBookingId) {
      setTab("upcoming");
    }
  }, [highlightedBookingId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyBookings();
      setBookings(data);
    } catch (err: any) {
      console.error("Failed to load bookings", err);
      setError(err?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!booking.endTime) return false;

        const end = new Date(booking.endTime);
        const status = booking.status?.toLowerCase();

        return end > now && status !== "cancelled" && status !== "completed";
      })
      .sort((a, b) => {
        const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
        return aTime - bTime;
      });
  }, [bookings]);

  const pastBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!booking.endTime) return true;

        const end = new Date(booking.endTime);
        const status = booking.status?.toLowerCase();

        return (
          end <= now ||
          status === "cancelled" ||
          status === "completed" ||
          status === "noshow"
        );
      })
      .sort((a, b) => {
        const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
        return bTime - aTime;
      });
  }, [bookings]);

  const visibleBookings = tab === "upcoming" ? upcomingBookings : pastBookings;

  useEffect(() => {
    if (!highlightedBookingId || loading) return;

    const el = bookingRefs.current[highlightedBookingId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedBookingId, loading, visibleBookings]);

  const handleCancelBooking = async (bookingId: number) => {
    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      await loadBookings();
    } catch (err: any) {
      console.error("Failed to cancel booking", err);
      setError(err?.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCheckInBooking = async (bookingId: number) => {
    try {
      setCheckingInId(bookingId);
      await checkInBooking(bookingId);
      await loadBookings();
    } catch (err: any) {
      console.error("Failed to check in", err);
      setError(err?.message || "Failed to check in.");
    } finally {
      setCheckingInId(null);
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";

    return new Date(value).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayStatus = (booking: Booking) => {
    const status = booking.status?.toLowerCase();
    const start = booking.startTime ? new Date(booking.startTime) : null;
    const end = booking.endTime ? new Date(booking.endTime) : null;

    if (status === "cancelled") return "Cancelled";
    if (status === "completed") return "Completed";
    if (status === "noshow") return "No Show";
    if (status === "checkedin" || status === "checked in") return "Checked In";

    if (start && end && start <= now && end > now) {
      return "In Progress";
    }

    return booking.status || "Scheduled";
  };

  const getStatusClass = (booking: Booking) => {
    const displayStatus = getDisplayStatus(booking).toLowerCase();

    if (displayStatus === "scheduled") return "status-pill scheduled";
    if (displayStatus === "cancelled") return "status-pill cancelled";
    if (displayStatus === "completed") return "status-pill completed";
    if (displayStatus === "checked in") return "status-pill checked-in";
    if (displayStatus === "in progress") return "status-pill in-progress";
    if (displayStatus === "no show") return "status-pill noshow";

    return "status-pill";
  };

  const canCheckIn = (booking: Booking) => {
    if (!booking.startTime || !booking.status) return false;

    const status = booking.status.toLowerCase();
    if (status !== "scheduled") return false;

    const start = new Date(booking.startTime);
    const checkInOpen = new Date(start.getTime() - 5 * 60 * 1000);
    const checkInClose = new Date(start.getTime() + 5 * 60 * 1000);

    return now >= checkInOpen && now <= checkInClose;
  };

  const canCancel = (booking: Booking) => {
    const status = booking.status?.toLowerCase();
    return status !== "cancelled" && status !== "completed";
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">
            View and manage your upcoming and past room reservations.
          </p>
        </div>
      </div>

      {highlightedBookingId > 0 && (
        <div className="admin-card" style={{ marginBottom: 12 }}>
          <p style={{ margin: 0 }}>
            Your booking is highlighted below. Please check in.
          </p>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div className="tabs">
            <button
              className={`tab-btn ${tab === "upcoming" ? "active" : ""}`}
              onClick={() => setTab("upcoming")}
              type="button"
            >
              Upcoming
            </button>
            <button
              className={`tab-btn ${tab === "past" ? "active" : ""}`}
              onClick={() => setTab("past")}
              type="button"
            >
              Past
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="empty-state">
            <h3>Loading bookings...</h3>
            <p>Please wait while we fetch your reservations.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Could not load bookings</h3>
            <p>{error}</p>
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="empty-state">
            {tab === "upcoming" ? (
              <>
                <h3>No upcoming bookings</h3>
                <p>
                  You don’t have any reservations yet. Go to <strong>Rooms</strong> to book one.
                </p>
              </>
            ) : (
              <>
                <h3>No past bookings</h3>
                <p>Your past reservations will appear here once available.</p>
              </>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {visibleBookings.map((booking) => (
              <div
                key={booking.bookingId}
                ref={(el) => {
                  bookingRefs.current[booking.bookingId] = el;
                }}
                className={`booking-item ${
                  booking.bookingId === highlightedBookingId ? "booking-item-highlighted" : ""
                }`}
              >
                <div className="booking-item-left">
                  <div className="booking-title-row">
                    <h3 className="booking-room-name">{booking.roomName}</h3>
                    <span className={getStatusClass(booking)}>
                      {getDisplayStatus(booking)}
                    </span>
                  </div>

                  <p className="booking-time">
                    <strong>Start:</strong> {formatDateTime(booking.startTime)}
                  </p>

                  <p className="booking-time">
                    <strong>End:</strong> {formatDateTime(booking.endTime)}
                  </p>

                  {booking.checkedInAt && (
                    <p className="booking-time">
                      <strong>Checked In At:</strong> {formatDateTime(booking.checkedInAt)}
                    </p>
                  )}

                  {booking.purpose && (
                    <p className="booking-purpose">
                      <strong>Purpose:</strong> {booking.purpose}
                    </p>
                  )}
                </div>

                {tab === "upcoming" && (
                  <div className="booking-item-right" style={{ gap: 8 }}>
                    {canCheckIn(booking) && (
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() => handleCheckInBooking(booking.bookingId)}
                        disabled={checkingInId === booking.bookingId}
                      >
                        {checkingInId === booking.bookingId ? "Checking In..." : "Check In"}
                      </button>
                    )}

                    {canCancel(booking) && (
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        disabled={cancellingId === booking.bookingId}
                      >
                        {cancellingId === booking.bookingId ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
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

export default MyBookingsPage;