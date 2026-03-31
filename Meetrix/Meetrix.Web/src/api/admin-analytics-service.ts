import type { AdminDashboardSummary } from "../models/AdminDashboardSummary";
import api from "./client";

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const response = await api.get("/admin/analytics/dashboard");
  return response.data;
}