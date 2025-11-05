import React from "react";
import { Link, useLocation } from "react-router-dom";

const LABELS: Record<string, string> = {
  "/rooms": "Rooms",
  "/admin": "Admin Dashboard",
  "/admin/rooms": "Manage Rooms",
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const segments = path.split("/").filter(Boolean); // ["admin", "rooms"]
  const crumbs = segments.map((_, idx) => {
    const url = "/" + segments.slice(0, idx + 1).join("/");
    return { url, label: LABELS[url] ?? url.split("/").pop() };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav style={{ padding: "12px 24px", fontSize: 14 }}>
      <Link to="/rooms" style={{ textDecoration: "none" }}>
        Home
      </Link>
      {crumbs.map((crumb, idx) => (
        <span key={crumb.url}>
          {" "}
          /{" "}
          {idx === crumbs.length - 1 ? (
            <span style={{ fontWeight: 600 }}>{crumb.label}</span>
          ) : (
            <Link to={crumb.url} style={{ textDecoration: "none" }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
