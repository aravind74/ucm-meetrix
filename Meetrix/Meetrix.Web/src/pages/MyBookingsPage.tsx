import type React from "react";
import { useState } from "react";

const MyBookingsPage: React.FC = () => {
    const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="page-title">My Bookings</h1>
                    <p className="page-subtitle">
                        View and manage your upcoming and past room reservations.
                    </p>
                </div>
            </div>

            {/* Toolbar / Tabs */}
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
                <div className="toolbar-right">
                    {/* (Optional) Add filters later: date range, status, room */}
                </div>
            </div>

            {/* Content */}
            <div className="admin-card">
                {/* Empty state for now */}
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
                            <p>Your historical bookings will appear here once available.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookingsPage