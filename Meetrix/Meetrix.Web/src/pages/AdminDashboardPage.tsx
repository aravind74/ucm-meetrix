import React, { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "../api/admin-analytics-service";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { AdminDashboardSummary } from "../models/AdminDashboardSummary";

const PIE_COLORS = ["#08185c", "#1c2f7d", "#3b82f6", "#60a5fa", "#93c5fd"];

const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminDashboardSummary();
        setSummary(data);
      } catch (err: any) {
        console.error("Failed to load dashboard", err);
        setError(err?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${normalizedHour}:00 ${suffix}`;
  };

  const peakHoursChartData =
    summary?.peakHours.map((item) => ({
      ...item,
      hourLabel: formatHour(item.hour),
    })) ?? [];

  const renderPieLabel = ({ payload, percent }: any) =>
    `${payload?.roomName ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Loading analytics...</p>
          </div>
        </div>

        <div className="admin-card">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Unable to load analytics.</p>
          </div>
        </div>

        <div className="admin-card">
          <p style={{ color: "#b91c1c" }}>{error || "Something went wrong."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            View booking trends, room usage, and waitlist activity.
          </p>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Total Bookings</p>
          <h2 className="dashboard-stat-value">{summary.totalBookings}</h2>
        </div>

        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Current Bookings</p>
          <h2 className="dashboard-stat-value">{summary.currentBookings}</h2>
        </div>

        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Cancelled Bookings</p>
          <h2 className="dashboard-stat-value">{summary.cancelledBookings}</h2>
        </div>

        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">No Shows</p>
          <h2 className="dashboard-stat-value">{summary.noShowBookings}</h2>
        </div>

        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Active Rooms</p>
          <h2 className="dashboard-stat-value">{summary.totalRooms}</h2>
        </div>

        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Active Waitlist</p>
          <h2 className="dashboard-stat-value">{summary.activeWaitlistEntries}</h2>
        </div>
      </div>

      <div className="dashboard-sections-grid">
        <div className="admin-card">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Top Rooms</h3>
            <p className="dashboard-section-subtitle">
              Most frequently booked rooms
            </p>
          </div>

          {summary.topRooms.length === 0 ? (
            <div className="empty-state">
              <h3>No room usage data</h3>
              <p>Top room analytics will appear here once bookings are available.</p>
            </div>
          ) : (
            <div className="dashboard-chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={summary.topRooms}
                    dataKey="bookingCount"
                    nameKey="roomName"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={renderPieLabel}
                  >
                    {summary.topRooms.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Peak Hours</h3>
            <p className="dashboard-section-subtitle">
              Most common booking start times
            </p>
          </div>

          {peakHoursChartData.length === 0 ? (
            <div className="empty-state">
              <h3>No peak hour data</h3>
              <p>Peak booking hours will appear here once bookings are available.</p>
            </div>
          ) : (
            <div className="dashboard-chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={peakHoursChartData}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="hourLabel" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookingCount" name="Bookings" fill="#08185c" radius={[6, 6, 0, 0]} barSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;