import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import menu from "../assets/menu.svg";
import room from "../assets/room.svg";
import dashboard from "../assets/dashboard.svg";
import building from "../assets/building.svg";


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
    color: "var(--color-sidebar-text)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const activeBg = "rgba(255,255,255,0.16)";
  

  const renderItem = (to: string, icon: string, label: string) => (
  <Link
    to={to}
    style={{
      ...baseItemStyle,
      justifyContent: collapsed ? "center" : "flex-start",
      backgroundColor: isActive(to) ? activeBg : "transparent",
    }}
  >
    <img src={icon} alt="" className="icon" />
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
            <img src={menu} alt="Toggle sidebar" className="icon" />
          </button>
        </div>

        <nav className="sidebar-nav">
  {renderItem("/rooms", room, "Rooms")}
  {isAdmin && (
    <>
      {renderItem("/admin", dashboard, "Dashboard")}
      {renderItem("/admin/rooms", building, "Manage Rooms")}
    </>
  )}
</nav>

      </div>
    </aside>
  );
};

/* Simple inline icons (no extra library needed) */
const RoomsIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const DashboardIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="11" width="7" height="10" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const BuildingIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="10" height="18" rx="1" />
    <path d="M9 7h1M9 11h1M9 15h1" />
    <path d="M18 9v12" />
    <path d="M16 21h4" />
  </svg>
);

export default Sidebar;
