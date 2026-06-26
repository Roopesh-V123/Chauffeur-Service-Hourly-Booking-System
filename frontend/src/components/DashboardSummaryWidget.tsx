"use client";

import React, { useState, useEffect, useRef } from "react";
import { KpiCardsSkeleton } from "./FeedbackStates";
import { API_BASE_URL } from "@/app/api";

/**
 * @hook useCountUp
 * @description Animates a number from 0 up to `target` over `duration` ms.
 * Returns the current animated display value.
 * Uses easeOutExpo for a premium deceleration feel.
 */
function useCountUp(target: number, duration = 1200, trigger = true): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger || target === 0) {
      setCurrent(target);
      return;
    }

    // Reset to 0 every time target changes so the count-up replays
    setCurrent(0);
    startTimeRef.current = null;

    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, trigger]);

  return current;
}

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 19: Dashboard Summary Widget
// Aesthetic: Navy Blue and Crisp White, 70% structural / 30% logic ratio, glassmorphism

interface AlertNotification {
  id: string;
  message: string;
  type: "warning" | "info";
  timestamp: string;
}

interface DashboardSummaryData {
  active_bookings_count: number;
  pending_payments_count: number;
  pending_payments_amount: number;
  alerts: AlertNotification[];
}

export default function DashboardSummaryWidget() {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Hover states for each KPI card
  const [hoverBookings, setHoverBookings] = useState(false);
  const [hoverBalance, setHoverBalance] = useState(false);
  const [hoverAlerts, setHoverAlerts] = useState(false);

  // ── Count-up animation values (animate from 0 → real value on data load) ──
  const animatedBookings = useCountUp(data?.active_bookings_count ?? 0, 1200, !loading && !!data);
  const animatedBalance  = useCountUp(data?.pending_payments_amount ?? 0, 1400, !loading && !!data);
  const animatedPending  = useCountUp(data?.pending_payments_count ?? 0, 1200, !loading && !!data);

  // Mock data fallback if database or API is offline
  const mockSummary: DashboardSummaryData = {
    active_bookings_count: 5,
    pending_payments_count: 3,
    pending_payments_amount: 18900,
    alerts: [
      {
        id: "mock-alert-1",
        message: "Booking Completed but Payment Pending for passenger Microsoft India.",
        type: "warning",
        timestamp: new Date().toISOString()
      },
      {
        id: "mock-alert-2",
        message: "High-duration Active booking for Lead Operator (9 hrs). Please monitor.",
        type: "info",
        timestamp: new Date().toISOString()
      },
      {
        id: "mock-alert-3",
        message: "Active vehicle AP-09-XX-1234 en route. Billing meter active.",
        type: "info",
        timestamp: new Date().toISOString()
      }
    ]
  };

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`);
        if (!response.ok) throw new Error("API offline");
        const json = await response.json();
        if (json.success && json.data) {
          setData(json.data);
          setIsOffline(false);
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        console.warn("[SummaryWidget] API offline, loading mock layout data.");
        setData(mockSummary);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
    const interval = setInterval(fetchSummary, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <KpiCardsSkeleton />;
  }

  return (
    <>
      {/* ── Inline transition keyframes ── */}
      <style>{`
        @keyframes kpi-num-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .kpi-num-hover { animation: kpi-num-pop 0.35s ease forwards; }

        .kpi-card {
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.28s ease, transform 0.28s ease, border-color 0.28s ease;
        }
        .kpi-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.28s ease;
          pointer-events: none;
        }
        /* Bookings card — cyan glow */
        .kpi-card-bookings::after {
          background: linear-gradient(135deg, rgba(72,202,228,0.06) 0%, transparent 70%);
        }
        .kpi-card-bookings:hover::after { opacity: 1; }
        .kpi-card-bookings:hover {
          box-shadow: 0 8px 32px rgba(72,202,228,0.18), 0 2px 8px rgba(11,19,43,0.08);
          transform: translateY(-3px);
          border-color: rgba(72,202,228,0.45) !important;
        }
        /* Balance card — gold glow */
        .kpi-card-balance::after {
          background: linear-gradient(135deg, rgba(212,175,55,0.07) 0%, transparent 70%);
        }
        .kpi-card-balance:hover::after { opacity: 1; }
        .kpi-card-balance:hover {
          box-shadow: 0 8px 32px rgba(212,175,55,0.18), 0 2px 8px rgba(11,19,43,0.08);
          transform: translateY(-3px);
          border-color: rgba(212,175,55,0.45) !important;
        }
        /* Alerts card — blue glow */
        .kpi-card-alerts::after {
          background: linear-gradient(135deg, rgba(0,119,182,0.06) 0%, transparent 70%);
        }
        .kpi-card-alerts:hover::after { opacity: 1; }
        .kpi-card-alerts:hover {
          box-shadow: 0 8px 32px rgba(0,119,182,0.14), 0 2px 8px rgba(11,19,43,0.08);
          transform: translateY(-3px);
          border-color: rgba(0,119,182,0.35) !important;
        }

        /* Icon bubble ring on hover */
        .kpi-icon-bubble {
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }
        .kpi-card:hover .kpi-icon-bubble {
          transform: scale(1.15);
        }
        .kpi-card-bookings:hover .kpi-icon-bubble {
          box-shadow: 0 0 0 6px rgba(72,202,228,0.15);
        }
        .kpi-card-balance:hover .kpi-icon-bubble {
          box-shadow: 0 0 0 6px rgba(212,175,55,0.15);
        }
        .kpi-card-alerts:hover .kpi-icon-bubble {
          box-shadow: 0 0 0 6px rgba(0,119,182,0.12);
        }

        /* Alert row hover */
        .alert-row {
          transition: background 0.18s ease, transform 0.18s ease;
          cursor: default;
        }
        .alert-row:hover {
          filter: brightness(0.96);
          transform: translateX(3px);
        }

        /* Sub-label slide-up on card hover */
        .kpi-sublabel {
          transition: color 0.22s ease;
        }
        .kpi-card-bookings:hover .kpi-sublabel { color: #0077B6; }
        .kpi-card-balance:hover  .kpi-sublabel { color: #b8881e; }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* ── KPI 1: Active Rides ── */}
        <div
          className="kpi-card kpi-card-bookings bg-crisp-white/85 backdrop-blur-md border border-crisp-lightgray rounded-xl p-6 shadow-md flex items-center justify-between"
          onMouseEnter={() => setHoverBookings(true)}
          onMouseLeave={() => setHoverBookings(false)}
        >
          <div>
            <span className="text-[10px] text-navy-slate font-black uppercase tracking-wider block mb-1">
              Active Bookings
            </span>
            <h3
              className={`text-3xl font-black text-navy-dark leading-none transition-colors duration-200 ${
                hoverBookings ? "text-accent-cyan kpi-num-hover" : ""
              }`}
            >
              {animatedBookings.toLocaleString("en-IN")}
            </h3>
            <p className="kpi-sublabel text-[10px] text-accent-cyan font-bold mt-2">
              Vehicles currently on trip
            </p>
          </div>
          <div className="kpi-icon-bubble w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan flex-shrink-0 ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>

        {/* ── KPI 2: Outstanding Balance ── */}
        <div
          className="kpi-card kpi-card-balance bg-crisp-white/85 backdrop-blur-md border border-crisp-lightgray rounded-xl p-6 shadow-md flex items-center justify-between"
          onMouseEnter={() => setHoverBalance(true)}
          onMouseLeave={() => setHoverBalance(false)}
        >
          <div>
            <span className="text-[10px] text-navy-slate font-black uppercase tracking-wider block mb-1">
              Pending Balance
            </span>
            <h3
              className={`text-3xl font-black text-navy-dark leading-none text-ellipsis overflow-hidden max-w-[150px] transition-colors duration-200 ${
                hoverBalance ? "text-accent-gold kpi-num-hover" : ""
              }`}
            >
              ₹{animatedBalance.toLocaleString("en-IN")}
            </h3>
            <p className="kpi-sublabel text-[10px] text-accent-gold font-bold mt-2">
              Across {animatedPending} pending invoices
            </p>
          </div>
          <div className="kpi-icon-bubble w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold flex-shrink-0 ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* ── Dynamic Alerts/Notifications Panel ── */}
        <div
          className="kpi-card kpi-card-alerts bg-crisp-white/85 backdrop-blur-md border border-crisp-lightgray rounded-xl p-6 shadow-md flex flex-col justify-between"
          onMouseEnter={() => setHoverAlerts(true)}
          onMouseLeave={() => setHoverAlerts(false)}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="kpi-icon-bubble w-7 h-7 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue"
                  style={{ minWidth: "28px" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="text-[10px] text-navy-slate font-black uppercase tracking-wider">
                  Alerts & Notifications
                </span>
              </div>
              {isOffline && (
                <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
                  Simulated
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
              {data?.alerts && data.alerts.length > 0 ? (
                data.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-row flex items-start gap-2 p-2 rounded-lg text-[9px] font-semibold leading-relaxed border ${
                      alert.type === "warning"
                        ? "bg-amber-50/70 border-amber-200 text-amber-900"
                        : "bg-blue-50/70 border-blue-200 text-blue-900"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {alert.type === "warning" ? (
                        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{alert.message}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-navy-slate font-medium">No active system alerts.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
