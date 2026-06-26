/**
 * @file page.tsx
 * @description The root page layout component for the Chauffeur Service Hourly Booking System dashboard.
 * Dynamically switches between the Dashboard log table, new reservation entry form, billing trackers, and analytics reports.
 * Sidebar navigation replacing the top navbar for a premium client-facing experience.
 *
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 * @aesthetic Navy Blue (#0B132B) & Crisp White (#FFFFFF) (70% CSS, 30% Logic)
 */

"use client";

import React, { useState, useEffect } from "react";
import ChauffeurServiceHourlyBookingEntryForm from "@/components/ChauffeurServiceHourlyBookingEntryForm";
import ChauffeurServiceHourlyBookingDashboard from "@/components/ChauffeurServiceHourlyBookingDashboard";
import PaymentBillingTracker from "@/components/PaymentBillingTracker";
import ReportsAnalyticsDashboard from "@/components/ReportsAnalyticsDashboard";
import ChauffeurServiceCoreLogicResult from "@/components/ChauffeurServiceCoreLogicResult";
import Breadcrumb from "@/components/Breadcrumb";
import DashboardSummaryWidget from "@/components/DashboardSummaryWidget";

type TabType = "Dashboard" | "New Booking" | "Payments" | "Reports";

const navItems = [
  {
    id: "Dashboard" as TabType,
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    description: "Operations overview",
  },
  {
    id: "New Booking" as TabType,
    label: "New Booking",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Create reservation",
  },
  {
    id: "Payments" as TabType,
    label: "Payments",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    description: "Billing & invoices",
  },
  {
    id: "Reports" as TabType,
    label: "Reports",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    ),
    description: "Analytics & insights",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: sidebarCollapsed ? "72px" : "260px",
          transition: "width 300ms cubic-bezier(0.4,0,0.2,1)",
          background: "linear-gradient(180deg, var(--sidebar-gradient-start) 0%, var(--sidebar-gradient-end) 100%)",
          borderRight: "1px solid var(--sidebar-border)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          boxShadow: "4px 0 24px 0 var(--shadow-color)",
          overflow: "hidden",
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: sidebarCollapsed ? "24px 0" : "28px 24px 20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderBottom: "1px solid var(--sidebar-border)",
            minHeight: "88px",
            transition: "padding 300ms ease",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #008542, #00b057)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "1.2rem",
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(0,133,66,0.4)",
              letterSpacing: "0.08em",
            }}
          >
            M
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "var(--foreground)", fontWeight: 800, fontSize: "0.95rem", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                Manivtha Tours
              </div>
              <div style={{ color: "#008542", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.13em", textTransform: "uppercase", marginTop: "3px", whiteSpace: "nowrap" }}>
                Chauffeur Booking Platform
              </div>
            </div>
          )}
        </div>

        {/* Nav Section Label */}
        {!sidebarCollapsed && (
          <div style={{ padding: "20px 24px 8px 24px" }}>
            <span style={{ color: "var(--sidebar-label)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Navigation
            </span>
          </div>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: sidebarCollapsed ? "16px 0" : "8px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id.replace(" ", "-").toLowerCase()}`}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: sidebarCollapsed ? "13px 0" : "12px 14px",
                  borderRadius: sidebarCollapsed ? "0" : "10px",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  cursor: "pointer",
                  border: "none",
                  width: "100%",
                  transition: "all 200ms ease",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(0,133,66,0.85), rgba(0,133,66,0.18))"
                    : "transparent",
                  color: isActive ? "#fff" : "var(--sidebar-nav-inactive-fg)",
                  boxShadow: isActive ? "0 2px 12px rgba(0,133,66,0.25)" : "none",
                  borderLeft: isActive && !sidebarCollapsed ? "3px solid #008542" : "3px solid transparent",
                  marginLeft: sidebarCollapsed ? "0" : undefined,
                  paddingLeft: isActive && !sidebarCollapsed ? "11px" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-light)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--sidebar-nav-inactive-fg)";
                  }
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <div style={{ textAlign: "left", overflow: "hidden" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{item.label}</div>
                    <div style={{ fontSize: "0.65rem", color: isActive ? "rgba(255,255,255,0.6)" : "var(--muted)", whiteSpace: "nowrap", marginTop: "1px" }}>{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status Indicator */}
        {!sidebarCollapsed && (
          <div style={{ margin: "0 12px 12px 12px", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,133,66,0.08)", border: "1px solid rgba(0,133,66,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#008542", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ color: "#008542", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>System Live</span>
            </div>
            <div style={{ color: "var(--muted)", fontSize: "0.62rem", marginTop: "4px" }}>Integration Dashboard Active</div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            margin: "0 12px 16px 12px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 200ms ease",
          }}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-light)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
          }}
        >
          <svg
            style={{ width: "16px", height: "16px", transition: "transform 300ms ease", transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* ── Main Content Area ── */}
      <div
        style={{
          marginLeft: sidebarCollapsed ? "72px" : "260px",
          transition: "margin-left 300ms cubic-bezier(0.4,0,0.2,1)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "var(--background)",
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "0 32px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
            boxShadow: "0 4px 20px var(--shadow-color)",
          }}
        >
          {/* Page Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: "1rem", color: "var(--foreground)", lineHeight: 1.2 }}>
                {activeTab === "Dashboard" && "Operations Dashboard"}
                {activeTab === "New Booking" && "New Reservation"}
                {activeTab === "Payments" && "Payments & Billing"}
                {activeTab === "Reports" && "Reports & Analytics"}
              </h2>
              <p style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 500, marginTop: "2px" }}>
                Manivtha Tours & Travels · QA Reviewer (ID: MNVT-OP-9944)
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Quick nav pills */}
            <div style={{ display: "flex", gap: "6px" }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    transition: "all 150ms ease",
                    background: activeTab === item.id ? "#008542" : "var(--surface-light)",
                    color: activeTab === item.id ? "#fff" : "var(--muted)",
                    border: activeTab === item.id ? "1px solid transparent" : "1px solid var(--border)",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: "var(--surface-light)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--foreground)",
                transition: "all 200ms ease",
              }}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                // Sun Icon
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                // Moon Icon
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Live status dot */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#008542", boxShadow: "0 0 6px #008542" }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--muted)" }}>Live</span>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column" }}>

          {/* Welcome Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--welcome-gradient-start) 0%, var(--welcome-gradient-mid) 50%, var(--welcome-gradient-end) 100%)",
              color: "var(--welcome-text)",
              padding: "28px 32px",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 32px var(--shadow-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "28px",
              flexWrap: "wrap",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circle */}
            <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(0,133,66,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: "60px", bottom: "-60px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(0,133,66,0.08)", pointerEvents: "none" }} />
            <div>
              <h1 style={{ fontWeight: 900, fontSize: "1.5rem", letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0 }}>
                System Workspace Console
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "0.8rem", marginTop: "6px", fontWeight: 500 }}>
                Audit log dashboard with active alerts, navigation routing, and reports. QA Reviewer (ID: MNVT-OP-9944)
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb activeSection={activeTab} />

          {/* Content Sections */}
          <div style={{ flex: 1 }}>
            {activeTab === "Dashboard" && (
              <div className="space-y-8 animate-fadeIn">
                <DashboardSummaryWidget />
                <ChauffeurServiceHourlyBookingDashboard />
              </div>
            )}

            {activeTab === "New Booking" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                <div>
                  <ChauffeurServiceHourlyBookingEntryForm
                    onBookingSaved={() => setActiveTab("Dashboard")}
                  />
                </div>
                <div>
                  <ChauffeurServiceCoreLogicResult />
                </div>
              </div>
            )}

            {activeTab === "Payments" && (
              <div className="animate-fadeIn">
                <PaymentBillingTracker />
              </div>
            )}

            {activeTab === "Reports" && (
              <div className="animate-fadeIn">
                <ReportsAnalyticsDashboard />
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 500, margin: 0 }}>
            © 2026 Manivtha Tours & Travels · QA Reviewer (ID: MNVT-OP-9944) · Google Antigravity Clean Design System
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#008542" }} />
            <span style={{ fontSize: "0.68rem", color: "#008542", fontWeight: 600 }}>All Systems Operational</span>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
}
