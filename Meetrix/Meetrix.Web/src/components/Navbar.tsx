import React from "react";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo.png";

const Navbar: React.FC = () => {
    const { auth, logout } = useAuth();

    return (
        <header
            style={{
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                    src={logo}
                    alt="Meetrix logo"
                    style={{
                        height: "auto",
                        width: 74,
                        objectFit: "contain",
                        userSelect: "none",
                    }}
                />
                <span
                    style={{
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#08185c",
                    }}
                >
                    Meetrix
                </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, color: "#4b5563" }}>
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
                        fontSize: 13,
                    }}
                >
                    Logout
                </button>
            </div>
        </header>

    );
};

export default Navbar;
