import React from "react";

const AdminDashboardPage: React.FC = () => {
  // Later: fetch stats (total rooms, today’s bookings, etc.)
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <p>To Do</p>

      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <h3>Total Rooms</h3>
          <p></p>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <h3>Today&apos;s Bookings</h3>
          <p></p>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <h3>No-Show Rate</h3>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
