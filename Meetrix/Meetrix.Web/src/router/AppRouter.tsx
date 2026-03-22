import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RoomsPage from "../pages/RoomsPage";
import AdminRoomsPage from "../pages/AdminRoomsPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { AdminRoute } from "../auth/AdminRoute";
import AppLayout from "../layouts/AppLayout";
import RegisterPage from "../pages/RegisterPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import AdminBookingsPage from "../pages/AdminBookingsPage";

const AppRouter = () => (
  <Router>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* All authenticated pages share AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* default landing for non-admins */}
        <Route index element={<RoomsPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />

        {/* admin dashboard landing */}
        <Route
          path="admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        {/* manage rooms */}
        <Route
          path="admin/rooms"
          element={
            <AdminRoute>
              <AdminRoomsPage />
            </AdminRoute>
          }
        />

        {/* manage bookings */}
        <Route
          path="admin/bookings"
          element={
            <AdminRoute>
              <AdminBookingsPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;
