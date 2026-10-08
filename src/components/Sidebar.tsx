import { useState, type ReactNode } from "react";
import { getCurrentUser, clearAuth } from "../api";
import type { IconName, Navigate, Screen } from "./types";
import { Brand, Icon } from "./ui";

const navItems: { screen: Screen; label: string; icon: IconName }[] = [
  { screen: "home", label: "Home", icon: "home" },
  { screen: "typing", label: "Typing practice", icon: "keyboard" },
  { screen: "browse", label: "Browse courses", icon: "compass" },
  { screen: "dsa", label: "DSA practice", icon: "code" },
  { screen: "projects", label: "Projects", icon: "layers" },
];

export default function Sidebar({ screen, navigate, children }: { screen: Screen; navigate: Navigate; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const user = getCurrentUser();
  const initials = user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "ED";
  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar-top">
          <Brand compact={collapsed} />
          <button className="icon-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
            <Icon name="menu" />
          </button>
        </div>
        <nav>
          {navItems.map((item) => (
            <button key={item.screen} className={screen === item.screen ? "active" : ""} onClick={() => navigate(item.screen)} title={collapsed ? item.label : undefined}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user" style={{ cursor: "pointer" }} onClick={() => { if (confirm("Log out?")) { clearAuth(); navigate("landing"); } }} title="Click to log out">
          <span className="avatar">{initials}</span>
          <span><strong>{user?.name || "Student"}</strong><small>{user?.role || "First year"}</small></span>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
