// src/components/Sidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleSidebar }) => {
  const location = useLocation();
  const { auth } = useAuth();
  const isAdmin = auth.role?.trim().toLowerCase() === "admin";

  const isActive = (path: string) => location.pathname === path;

  const baseItemStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 4,
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const activeBg = "#1d4ed8";

  const renderItem = (to: string, icon: string, label: string) => (
    <Link
      to={to}
      style={{
        ...baseItemStyle,
        justifyContent: collapsed ? "center" : "flex-start",
        backgroundColor: isActive(to) ? activeBg : "transparent",
      }}
    >
      <span>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-inner">
        <div className="sidebar-header">
          <button
            onClick={onToggleSidebar}
            className="sidebar-toggle"
            aria-label="Toggle navigation"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {renderItem("/rooms", "🗂️", "Rooms")}

          {isAdmin && (
            <>
              {renderItem("/admin", "📊", "Dashboard")}
              {renderItem("/admin/rooms", "🏢", "Manage Rooms")}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
