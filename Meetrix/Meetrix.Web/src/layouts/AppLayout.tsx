// src/layout/AppLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import Sidebar from "../components/Sidebar";

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed((c) => !c)}
      />

      <div className="app-main">
        <Navbar /> {/* no toggle button here anymore */}
        <Breadcrumbs />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
