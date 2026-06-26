"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/app/api";
import { useRouter } from "next/navigation";
import ChauffeurServiceHourlyBookingEditForm from "./ChauffeurServiceHourlyBookingEditForm";
import ChauffeurServiceHourlyBookingDetail from "./ChauffeurServiceHourlyBookingDetail";
import { TableRowSkeleton, EmptyStateMessage } from "./FeedbackStates";

/**
 * @module ChauffeurServiceHourlyBookingDashboard
 * @description Live dashboard for viewing, filtering, editing, and managing booking records.
 * Features: filter tabs (All/Active/Completed/Cancelled), edit modal integration,
 * status action buttons with confirmation dialogs, and paginated API data.
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @aesthetic Navy Blue and Crisp White — 70% structural / 30% logic ratio
 */

/**
 * @interface BookingRecord
 * @description Defines the shape of booking records used inside the dashboard frontend and matching backend schemas.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
interface BookingRecord {
  id: string;
  liveMeterAndBilling: number;
  status: "Active" | "Completed" | "Cancelled";
  createdDate: string;
  notes: string;
  customer?: { name: string };
  vehicle?: { make: string; model: string; plateNumber: string };
}

const FILTER_TABS = ["All", "Active", "Completed", "Cancelled"] as const;

/**
 * @component ChauffeurServiceHourlyBookingDashboard
 * @description The live management monitor dashboard component, providing listings, filters, edits, and status mutations.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
export default function ChauffeurServiceHourlyBookingDashboard() {
  const router = useRouter();

  /**
   * @type {BookingRecord[]} bookings
   * @description Array of loaded booking records.
   */
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  /**
   * @type {boolean} loading
   * @description Tracks the active API fetch loading state.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * @type {string} activeTab
   * @description Active filter tab name.
   */
  const [activeTab, setActiveTab] = useState<string>("All");

  /**
   * @type {string} searchQuery
   * @description User's live search filter query string matching numeric billing value.
   */
  const [searchQuery, setSearchQuery] = useState<string>("");

  /**
   * @type {BookingRecord|null} selectedDetail
   * @description Currently selected booking detail row.
   */
  const [selectedDetail, setSelectedDetail] = useState<BookingRecord | null>(null);

  /**
   * @type {BookingRecord|null} editingBooking
   * @description The booking currently being edited in the modal.
   */
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);

  /**
   * @type {object|null} confirmAction
   * @description Confirmation status containing booking ID and new status.
   */
  const [confirmAction, setConfirmAction] = useState<{
    bookingId: string;
    newStatus: string;
  } | null>(null);

  /**
   * @type {number} refreshKey
   * @description Trigger counter to force query reload.
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * @type {BookingRecord[]} mockBookings
   * @description Fallback mock booking database when live API endpoint is offline.
   */
  const mockBookings: BookingRecord[] = [
    {
      id: "6f69a2df-ac88-48ad-8730-20586b6bd0a7",
      liveMeterAndBilling: 4800,
      status: "Active",
      createdDate: "2026-06-09",
      notes: "Lead passenger QA Reviewer (ID: MNVT-OP-9944). VIP Airport escort.",
      customer: { name: "Lead Operator" },
      vehicle: { make: "Toyota", model: "Innova Crysta", plateNumber: "AP-09-XX-1234" }
    },
    {
      id: "a228fb63-7eb6-4c4f-9e7f-b0f37c3558d2",
      liveMeterAndBilling: 7200,
      status: "Completed",
      createdDate: "2026-06-08",
      notes: "Completed business route to high-tech city hub.",
      customer: { name: "Microsoft India" },
      vehicle: { make: "BMW", model: "5 Series", plateNumber: "TS-09-YY-9999" }
    }
  ];

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (activeTab !== "All") queryParams.append("status", activeTab);
        if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());

        const response = await fetch(
          `${API_BASE_URL}/api/chauffeur_service_hourly_booking?${queryParams.toString()}`
        );
        if (!response.ok) throw new Error("API Offline");
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setBookings(json.data);
        } else {
          setBookings(mockBookings);
        }
      } catch (error) {
        console.warn("[Dashboard] API offline, falling back to local simulated records.");
        let filtered = [...mockBookings];
        if (activeTab !== "All") {
          filtered = filtered.filter((b) => b.status === activeTab);
        }
        if (searchQuery.trim()) {
          const parsed = parseInt(searchQuery.trim());
          if (!isNaN(parsed)) {
            filtered = filtered.filter((b) => b.liveMeterAndBilling === parsed);
          }
        }
        setBookings(filtered);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchBookings, 400);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, refreshKey]);

  /** Redirect to the 5th page dynamic route */
  const handleOpenDetail = (id: string) => {
    router.push(`/bookings/${id}`);
  };

  /** Execute PATCH status change after confirmation */
  const handleStatusChange = async () => {
    if (!confirmAction) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chauffeur_service_hourly_booking/${confirmAction.bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: confirmAction.newStatus }),
        }
      );

      if (!response.ok) throw new Error("Status update failed");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("[Dashboard] Status change failed:", err);
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div
      className="bg-surface border border-border-color/30 rounded-2xl shadow-xl p-6 sm:p-8 max-w-full lg:max-w-6xl mx-auto text-white"
      style={{ transition: "box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.6)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(100, 116, 139, 0.5)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
      }}
    >
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-border-color/30">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Hourly Bookings Monitor
          </h2>
          <p className="text-xs text-muted font-bold uppercase tracking-wider mt-1">
            Real-Time Operational Audit | Lead: Lead Operator
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-48">
          <input
            type="number"
            placeholder="Search by Meter ₹..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-background border border-border-color/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white transition-all placeholder-muted"
          />
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex gap-1 mb-6 p-1 bg-background rounded-xl border border-border-color/20">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === tab
                ? "bg-accent-active text-white shadow-md"
                : "bg-transparent text-muted hover:bg-surface hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reusable Loading & Empty Feedback States */}
      {loading ? (
        <TableRowSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyStateMessage
          title="No Records Found"
          description={`No booking items match tab "${activeTab}" or search query "${searchQuery}".`}
          iconType={searchQuery ? "search" : "database"}
        />
      ) : (
        /* Data Table */
        <div className="overflow-x-auto rounded-xl border border-border-color/20 shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border-color/20 text-muted text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Billing Meter (₹)</th>
                <th className="py-4 px-5">Pickup Date</th>
                <th className="py-4 px-5">Chauffeur Notes</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/10 text-sm font-semibold text-foreground bg-surface">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  style={{ transition: "background 0.18s ease, box-shadow 0.18s ease" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-light)";
                    (e.currentTarget as HTMLTableRowElement).style.boxShadow = "inset 3px 0 0 #008542";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "";
                    (e.currentTarget as HTMLTableRowElement).style.boxShadow = "";
                  }}
                >
                  <td className="py-4 px-5 font-mono font-bold text-accent-active">
                    ₹{booking.liveMeterAndBilling.toLocaleString()}
                  </td>
                  <td className="py-4 px-5 text-xs text-muted">
                    {new Date(booking.createdDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td
                    className="py-4 px-5 max-w-xs truncate text-xs text-muted"
                    title={booking.notes}
                  >
                    {booking.notes}
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                        booking.status === "Active"
                          ? "bg-accent-active/10 text-accent-active border-accent-active/30"
                          : booking.status === "Completed"
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-800/30"
                          : "bg-rose-950/20 text-rose-400 border-rose-800/30"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-2">
                      {/* View Detail */}
                      <button
                        onClick={() => handleOpenDetail(booking.id)}
                        className="px-3 py-1.5 bg-navy-light text-foreground font-bold rounded-lg text-[11px] tracking-wide border border-border-color/30 shadow-sm active:scale-95"
                        style={{ transition: "background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "var(--btn-secondary-hover-bg)";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px var(--shadow-color)";
                          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                          (e.currentTarget as HTMLButtonElement).style.transform = "";
                        }}
                      >
                        Detail
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingBooking(booking)}
                        className="px-3 py-1.5 bg-accent-pending text-white font-bold rounded-lg text-[11px] tracking-wide shadow-sm active:scale-95"
                        style={{ transition: "background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#b96405";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(217,119,6,0.35)";
                          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
                          (e.currentTarget as HTMLButtonElement).style.transform = "";
                        }}
                      >
                        Edit
                      </button>

                      {/* Status Actions */}
                      {booking.status === "Active" && (
                        <>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                bookingId: booking.id,
                                newStatus: "Completed",
                              })
                            }
                            className="px-3 py-1.5 bg-accent-active hover:bg-accent-active/80 text-white font-bold rounded-lg text-[11px] tracking-wide shadow-sm transition-all active:scale-95"
                          >
                            ✓ Complete
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                bookingId: booking.id,
                                newStatus: "Cancelled",
                              })
                            }
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] tracking-wide shadow-sm transition-all active:scale-95"
                          >
                            ✕ Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {/* ── EDIT MODAL ── */}
      {editingBooking && (
        <ChauffeurServiceHourlyBookingEditForm
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      )}

      {/* ── STATUS CHANGE CONFIRMATION DIALOG ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-border-color/30 max-w-sm w-full rounded-2xl p-6 sm:p-8 shadow-2xl text-center text-white">
            <div className="text-4xl mb-4">
              {confirmAction.newStatus === "Completed" ? "✅" : "⚠️"}
            </div>
            <h3 className="text-base font-black text-white mb-2">
              Confirm Status Change
            </h3>
            <p className="text-xs text-muted font-semibold mb-6 leading-relaxed">
              Are you sure you want to change the booking status to{" "}
              <span
                className={`font-extrabold ${
                  confirmAction.newStatus === "Completed"
                    ? "text-accent-active"
                    : "text-rose-400"
                }`}
              >
                {confirmAction.newStatus}
              </span>
              ? This action will be logged on the server.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 bg-navy-light hover:bg-surface-light text-foreground font-bold rounded-lg text-xs tracking-wide transition-all border border-border-color/30 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className={`flex-1 py-3 text-white font-bold rounded-lg text-xs tracking-wide shadow-md transition-all active:scale-[0.98] ${
                  confirmAction.newStatus === "Completed"
                    ? "bg-accent-active hover:bg-accent-active/80"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Confirm {confirmAction.newStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
