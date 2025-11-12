import React from "react";
import { Link, useLocation } from "react-router-dom";

const LABELS: Record<string, string> = {
    "/rooms": "Rooms",
    "/admin/dashboard": "Dashboard",
    "/admin/rooms": "Manage Rooms",
  };
  
  const Breadcrumbs: React.FC = () => {
    const { pathname } = useLocation();
  
    // remove "admin" segment from visible crumbs
    const segments = pathname
      .split("/")
      .filter(Boolean)
      .filter(seg => seg.toLowerCase() !== "admin");
  
    const crumbs = segments.map((_, idx) => {
      const url = "/" + segments.slice(0, idx + 1).join("/");
      const label =
        LABELS["/admin/" + segments.slice(0, idx + 1).join("/")] ??
        LABELS[url] ??
        url.split("/").pop();
      return { url, label: label ? label.charAt(0).toUpperCase() + label.slice(1) : "" };
    });
  
    if (crumbs.length === 0) return null;
  
    const homeUrl = pathname.startsWith("/admin") ? "/admin/dashboard" : "/rooms";
  
    return (
      <nav style={{ padding: "12px 24px", fontSize: 14 }}>
        <Link to={homeUrl} style={{ textDecoration: "none" }}>
          Home
        </Link>
        {crumbs.map((crumb, idx) => (
          <span key={crumb.url}>
            {" / "}
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
