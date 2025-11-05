// src/components/Navbar.tsx
import React from "react";
import { useAuth } from "../auth/AuthContext";

const Navbar: React.FC = () => {
  const { auth, logout } = useAuth();

  return (
    <header
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <div style={{ fontWeight: 600 }}>Meetrix</div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14 }}>
          {auth.fullName ?? auth.email}
          {auth.role && ` (${auth.role})`}
        </span>
        <button
          onClick={logout}
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
