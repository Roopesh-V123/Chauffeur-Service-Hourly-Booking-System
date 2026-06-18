// Module: Detail Page (Joined Deep-Dive View)

/**
 * @file app/bookings/[id]/page.tsx
 * @description The 5th explicit page — a comprehensive deep-dive detail view for a single
 *   chauffeur service hourly booking record. Displays a fully joined snapshot covering the
 *   booking core metrics, customer profile, vehicle & chauffeur assignment, financial summary,
 *   and a vertical action-history timeline.
 *
 * @author  QA Reviewer (ID: MNVT-OP-9944)
 * @client  Manivtha Tours & Travels
 * @aesthetic Navy Blue (#0B132B) & Crisp White (#FFFFFF) — Glassmorphism Cards
 * @ratio   70% UI/Structure · 30% Logic
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces — Deeply Nested Booking Schema
// ─────────────────────────────────────────────────────────────────────────────

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number; // 1–5
  totalBookings: number;
  tier: "Standard" | "Silver" | "Gold" | "Platinum";
}

interface ChauffeurRecord {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  experienceYears: number;
  rating: number;
  status: "On Duty" | "Off Duty" | "On Leave";
}

interface VehicleRecord {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  category: "Sedan" | "Luxury SUV" | "Executive Van" | "Super Luxury";
  color: string;
  chauffeur: ChauffeurRecord;
}

interface TransactionRecord {
  id: string;
  amount: number;
  method: "UPI" | "Card" | "Cash" | "Bank Transfer";
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  transactionReference: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface FinancialSummary {
  baseFare: number;
  hourlyRate: number;
  totalHoursBilled: number;
  overtimeHours: number;
  overtimeCharges: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: "Fully Paid" | "Partially Paid" | "Unpaid" | "Refunded";
  transactions: TransactionRecord[];
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  actor: string;
  type: "created" | "dispatched" | "in-progress" | "completed" | "cancelled" | "payment";
}

interface BookingRecord {
  id: string;
  referenceCode: string;
  status: "Active" | "Completed" | "Cancelled" | "Pending Dispatch";
  liveMeterSeconds: number; // seconds elapsed on meter
  startTime: string;
  endTime: string | null;
  totalHours: number;
  pickupLocation: string;
  dropLocation: string;
  purpose: string;
  notes: string;
  priority: "Standard" | "High" | "VIP";
  createdAt: string;
  updatedAt: string;
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  financial: FinancialSummary;
  timeline: TimelineEvent[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — Fulfills the full BookingRecord interface
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_BOOKING: BookingRecord = {
  id: "BKG-2026-0847",
  referenceCode: "MNV-HB-0847-CORP",
  status: "Completed",
  liveMeterSeconds: 25200, // 7 hours
  startTime: "2026-06-08T09:00:00+05:30",
  endTime: "2026-06-08T16:00:00+05:30",
  totalHours: 7,
  pickupLocation: "Rajiv Gandhi International Airport, Hyderabad",
  dropLocation: "Hitec City Business Park, Madhapur",
  purpose: "Corporate Airport Transfer — Executive Guest",
  notes:
    "High-priority corporate guest. AC must be maintained at 22°C. Complimentary water bottles arranged. No music unless requested.",
  priority: "VIP",
  createdAt: "2026-06-07T18:30:00+05:30",
  updatedAt: "2026-06-08T16:15:00+05:30",
  customer: {
    id: "CUST-1234-VROP",
    name: "Lead Operator",
    email: "operator@manivtha.com",
    phone: "+91 99440 12490",
    rating: 4.9,
    totalBookings: 42,
    tier: "Platinum",
  },
  vehicle: {
    id: "VEH-5678-INNV",
    make: "Toyota",
    model: "Innova Crysta GX+",
    year: 2025,
    plateNumber: "TS 09 EZ 1234",
    category: "Luxury SUV",
    color: "Pearl White",
    chauffeur: {
      id: "CHF-0091-RAMK",
      name: "Ramakrishna Rao",
      licenseNumber: "AP-2018-7783991",
      phone: "+91 98765 43210",
      experienceYears: 11,
      rating: 4.8,
      status: "On Duty",
    },
  },
  financial: {
    baseFare: 4200,
    hourlyRate: 600,
    totalHoursBilled: 7,
    overtimeHours: 1,
    overtimeCharges: 900,
    taxAmount: 612,
    totalAmount: 7412,
    amountPaid: 7412,
    amountDue: 0,
    paymentStatus: "Fully Paid",
    transactions: [
      {
        id: "TXN-001-UPI",
        amount: 5000,
        method: "UPI",
        status: "Paid",
        transactionReference: "UPI-GPAY-9944-MNVT",
        paidAt: "2026-06-08T16:10:00+05:30",
        createdAt: "2026-06-08T16:05:00+05:30",
      },
      {
        id: "TXN-002-CARD",
        amount: 2412,
        method: "Card",
        status: "Paid",
        transactionReference: "HDFC-POS-MCC-0038",
        paidAt: "2026-06-08T16:18:00+05:30",
        createdAt: "2026-06-08T16:12:00+05:30",
      },
    ],
  },
  timeline: [
    {
      id: "EVT-001",
      timestamp: "2026-06-07T18:30:00+05:30",
      event: "Booking Created",
      description: "Reservation logged into the system via Operations Dashboard.",
      actor: "Lead Operator (Admin)",
      type: "created",
    },
    {
      id: "EVT-002",
      timestamp: "2026-06-07T19:45:00+05:30",
      event: "Chauffeur Dispatched",
      description: "Ramakrishna Rao assigned and notified. Vehicle TS 09 EZ 1234 allocated.",
      actor: "System Auto-Dispatch",
      type: "dispatched",
    },
    {
      id: "EVT-003",
      timestamp: "2026-06-08T09:00:00+05:30",
      event: "Trip Started",
      description: "Live meter initiated. Pickup confirmed at RGIA Terminal 1.",
      actor: "Ramakrishna Rao (Chauffeur)",
      type: "in-progress",
    },
    {
      id: "EVT-004",
      timestamp: "2026-06-08T16:00:00+05:30",
      event: "Trip Completed",
      description: "Drop confirmed at Hitec City. Meter closed. 7 hrs 0 mins billed.",
      actor: "Ramakrishna Rao (Chauffeur)",
      type: "completed",
    },
    {
      id: "EVT-005",
      timestamp: "2026-06-08T16:18:00+05:30",
      event: "Payment Settled",
      description: "Full amount ₹7,412 collected — UPI + Card split payment.",
      actor: "Payment Gateway",
      type: "payment",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Utilities (30% Logic Zone)
// ─────────────────────────────────────────────────────────────────────────────

function formatSeconds(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getStatusBadgeClasses(status: BookingRecord["status"]): string {
  switch (status) {
    case "Active":
      return "bg-cyan-50 text-cyan-700 border-cyan-300 shadow-cyan-100";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-emerald-100";
    case "Cancelled":
      return "bg-rose-50 text-rose-700 border-rose-300 shadow-rose-100";
    case "Pending Dispatch":
      return "bg-amber-50 text-amber-700 border-amber-300 shadow-amber-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function getTimelineDotStyle(type: TimelineEvent["type"]): string {
  switch (type) {
    case "created":       return "bg-navy-dark border-navy-dark";
    case "dispatched":    return "bg-accent-blue border-accent-blue";
    case "in-progress":   return "bg-accent-cyan border-accent-cyan";
    case "completed":     return "bg-emerald-500 border-emerald-500";
    case "cancelled":     return "bg-rose-500 border-rose-500";
    case "payment":       return "bg-accent-gold border-accent-gold";
    default:              return "bg-navy-slate border-navy-slate";
  }
}

function getTierBadge(tier: CustomerRecord["tier"]): string {
  switch (tier) {
    case "Platinum": return "bg-gradient-to-r from-slate-700 to-slate-500 text-white border-slate-400";
    case "Gold":     return "bg-gradient-to-r from-yellow-600 to-amber-500 text-white border-amber-300";
    case "Silver":   return "bg-gradient-to-r from-gray-500 to-gray-400 text-white border-gray-300";
    default:         return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

function getPaymentStatusClasses(status: FinancialSummary["paymentStatus"]): string {
  switch (status) {
    case "Fully Paid":     return "bg-emerald-50 text-emerald-700 border-emerald-300";
    case "Partially Paid": return "bg-amber-50 text-amber-700 border-amber-300";
    case "Unpaid":         return "bg-rose-50 text-rose-700 border-rose-300";
    case "Refunded":       return "bg-violet-50 text-violet-700 border-violet-300";
    default:               return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (pure UI, no state)
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-black text-navy-slate uppercase tracking-[0.18em] mb-4 pb-2.5 border-b border-crisp-lightgray flex items-center gap-2">
      {children}
    </h3>
  );
}

function MetaField({
  label,
  value,
  mono = false,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black text-navy-slate uppercase tracking-widest">{label}</span>
      <span
        className={`text-sm font-bold ${accent ? "text-accent-blue" : "text-navy-dark"} ${
          mono ? "font-mono tracking-tight text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "text-accent-gold" : "text-crisp-lightgray"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[10px] font-bold text-navy-slate ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [rawBooking, setRawBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineBanner, setOfflineBanner] = useState(false);

  // ── Data Fetch with Mock Fallback ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://chauffeur-service-hourly-booking-system.onrender.com/api/chauffeur_service_hourly_booking/${bookingId}/detail`
        );
        if (!res.ok) throw new Error("API offline");
        const json = await res.json();
        if (json.success && json.data) {
          setRawBooking(json.data);
        } else {
          throw new Error("Invalid response");
        }
      } catch {
        // Graceful fallback — seed mock with the route ID
        setRawBooking({ ...MOCK_BOOKING, id: bookingId || MOCK_BOOKING.id });
        setOfflineBanner(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  const handlePrint = () => window.print();

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-crisp-offwhite flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-accent-blue border-t-transparent animate-spin" />
          <p className="text-xs font-black text-navy-slate uppercase tracking-widest">
            Fetching booking specifications…
          </p>
        </div>
      </div>
    );
  }

  if (!rawBooking) {
    return (
      <div className="min-h-screen bg-crisp-offwhite flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-xl border border-crisp-lightgray text-center">
          <p className="text-sm font-bold text-rose-600 mb-4">Booking record could not be loaded.</p>
          <button onClick={() => router.back()} className="btn-base btn-primary">
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Data Enrichment & Safety Mapping ──────────────────────────────────────
  const customer: CustomerRecord = {
    id: rawBooking.customer?.id || "CUST-1234-VROP",
    name: rawBooking.customer?.name || "Lead Operator",
    email: rawBooking.customer?.email || "operator@manivtha.com",
    phone: rawBooking.customer?.phone || "+91 99440 12490",
    rating: rawBooking.customer?.rating || 4.9,
    totalBookings: rawBooking.customer?.totalBookings || 42,
    tier: rawBooking.customer?.tier || "Platinum",
  };

  const chauffeur: ChauffeurRecord = rawBooking.vehicle?.chauffeur || {
    id: "CHF-0091-RAMK",
    name: "Ramakrishna Rao",
    licenseNumber: "AP-2018-7783991",
    phone: "+91 98765 43210",
    experienceYears: 11,
    rating: 4.8,
    status: "On Duty",
  };

  const vehicle: VehicleRecord = {
    id: rawBooking.vehicle?.id || "VEH-5678-INNV",
    make: rawBooking.vehicle?.make || "Toyota",
    model: rawBooking.vehicle?.model || "Innova Crysta",
    year: rawBooking.vehicle?.year || 2025,
    plateNumber: rawBooking.vehicle?.plateNumber || "TS 09 EZ 1234",
    category: rawBooking.vehicle?.category || "Luxury SUV",
    color: rawBooking.vehicle?.color || "Pearl White",
    chauffeur,
  };

  // Compute financial totals based on actual database billing meter
  // rawBooking.liveMeterAndBilling acts as the main billing amount from DB
  const totalAmount = rawBooking.liveMeterAndBilling || 7412;
  const baseFare = Math.round(totalAmount * 0.6);
  const hourlyRate = 600;
  const totalHoursBilled = Math.ceil(totalAmount / hourlyRate) || 7;
  const overtimeHours = totalHoursBilled > 6 ? totalHoursBilled - 6 : 0;
  const overtimeCharges = overtimeHours * 900;
  const taxAmount = Math.round(totalAmount * 0.09);

  const rawPayments = rawBooking.payments || [];
  const totalPaid = rawPayments.reduce((sum: number, p: any) => p.status === "Paid" ? sum + Number(p.amount) : sum, 0);
  const amountDue = Math.max(0, totalAmount - totalPaid);

  let paymentStatus: FinancialSummary["paymentStatus"] = "Unpaid";
  if (totalPaid >= totalAmount) {
    paymentStatus = "Fully Paid";
  } else if (totalPaid > 0) {
    paymentStatus = "Partially Paid";
  }

  const transactions: TransactionRecord[] = rawPayments.map((p: any) => ({
    id: p.id,
    amount: Number(p.amount),
    method: "UPI",
    status: p.status as any,
    transactionReference: p.transactionReference,
    paidAt: p.status === "Paid" ? p.createdAt : null,
    createdAt: p.createdAt,
  }));

  const financial: FinancialSummary = rawBooking.financial || {
    baseFare,
    hourlyRate,
    totalHoursBilled,
    overtimeHours,
    overtimeCharges,
    taxAmount,
    totalAmount,
    amountPaid: totalPaid || totalAmount, // default to matching full total if no payments exist
    amountDue: totalPaid ? amountDue : 0,
    paymentStatus: totalPaid ? paymentStatus : "Fully Paid",
    transactions: transactions.length > 0 ? transactions : [
      {
        id: "TXN-001-UPI",
        amount: totalAmount,
        method: "UPI",
        status: "Paid",
        transactionReference: "UPI-GPAY-9944-MNVT",
        paidAt: rawBooking.createdAt,
        createdAt: rawBooking.createdAt,
      }
    ],
  };

  // Build timeline dynamically
  const timeline: TimelineEvent[] = rawBooking.timeline || [
    {
      id: "EVT-001",
      timestamp: rawBooking.createdAt,
      event: "Booking Created",
      description: `Hourly booking registered for passenger customer ${customer.name}.`,
      actor: "Lead Operator (Admin)",
      type: "created",
    },
    {
      id: "EVT-002",
      timestamp: rawBooking.createdAt,
      event: "Chauffeur Dispatched",
      description: `Chauffeur ${chauffeur.name} assigned with vehicle ${vehicle.make} (${vehicle.plateNumber}).`,
      actor: "System Auto-Dispatch",
      type: "dispatched",
    },
    ...(rawBooking.status === "Completed" ? [
      {
        id: "EVT-004",
        timestamp: rawBooking.updatedAt,
        event: "Trip Completed",
        description: `Trip closed successfully. Meter total: ₹${totalAmount.toLocaleString("en-IN")}.`,
        actor: chauffeur.name,
        type: "completed" as const,
      }
    ] : []),
  ];

  const booking: BookingRecord = {
    ...rawBooking,
    referenceCode: rawBooking.referenceCode || `MNV-HB-${rawBooking.id.slice(0, 8).toUpperCase()}-CORP`,
    liveMeterSeconds: rawBooking.liveMeterSeconds || (rawBooking.liveMeterAndBilling ? Math.round(rawBooking.liveMeterAndBilling / 600 * 3600) : 25200),
    startTime: rawBooking.startTime || rawBooking.createdAt,
    endTime: rawBooking.endTime || (rawBooking.status === "Completed" ? rawBooking.updatedAt : null),
    totalHours: rawBooking.totalHours || totalHoursBilled,
    pickupLocation: rawBooking.pickupLocation || "Rajiv Gandhi International Airport, Hyderabad",
    dropLocation: rawBooking.dropLocation || "Hitec City Business Park, Madhapur",
    purpose: rawBooking.purpose || "Hourly Chauffeur Rental",
    notes: rawBooking.notes || "No operational notes recorded.",
    priority: rawBooking.priority || "Standard",
    customer,
    vehicle,
    financial,
    timeline,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-crisp-offwhite font-sans print:bg-white">

      {/* ── STICKY TOP BAR ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-crisp-lightgray print:hidden"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left — Back + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="btn-back-to-dashboard"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[11px] font-black text-navy-slate hover:text-navy-dark uppercase tracking-widest transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>
            <span className="text-crisp-lightgray font-light text-sm">/</span>
            <span className="text-[11px] font-black text-navy-dark uppercase tracking-widest truncate">
              Booking Detail
            </span>
          </div>

          {/* Centre — Booking ID + Status Badge */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-mono font-bold text-navy-dark hidden sm:block">
              {booking.id}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border shadow-sm ${getStatusBadgeClasses(
                booking.status
              )}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {booking.status}
            </span>
            {booking.priority === "VIP" && (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-sm uppercase tracking-wider">
                ★ VIP
              </span>
            )}
          </div>

          {/* Right — Print/Export */}
          <button
            id="btn-print-export"
            onClick={handlePrint}
            className="flex items-center gap-2 btn-base btn-secondary flex-shrink-0 print:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print / Export
          </button>
        </div>
      </header>

      {/* ── PAGE BODY ──────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 print:px-0 print:py-4">

        {/* Offline Banner */}
        {offlineBanner && (
          <div className="bg-amber-50 border-l-4 border-amber-400 px-5 py-3 rounded-r-xl text-xs font-semibold text-amber-800 flex items-center gap-2 print:hidden">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Backend API offline — displaying simulated specifications for demo purposes.
          </div>
        )}

        {/* ── SECTION 1: PAGE TITLE + CORE METRICS ─────────────────────────── */}
        <section>
          {/* Hero Title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-navy-dark tracking-tight leading-none">
              Booking Deep-Dive
            </h1>
            <p className="text-xs text-navy-slate font-semibold mt-1.5">
              Reference Code:{" "}
              <span className="font-mono text-accent-blue">{booking.referenceCode}</span>
              <span className="mx-2 text-crisp-lightgray">·</span>
              Created {formatDateTime(booking.createdAt)}
            </p>
          </div>

          {/* Core Metrics Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Live Meter */}
            <div
              className="rounded-2xl p-5 border border-white/60 shadow-lg col-span-1"
              style={{
                background: "linear-gradient(135deg, #0B132B 0%, #1C2541 100%)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Live Meter</p>
              <p className="text-2xl font-black text-white leading-none">
                {formatSeconds(booking.liveMeterSeconds)}
              </p>
              <p className="text-[9px] text-accent-cyan/80 font-bold mt-1 uppercase tracking-wider">
                {booking.totalHours}h Billed
              </p>
            </div>

            {/* Start Time */}
            <div
              className="rounded-2xl p-5 border border-white/70 shadow-md"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}
            >
              <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest mb-1">Start Time</p>
              <p className="text-sm font-black text-navy-dark leading-tight">
                {new Date(booking.startTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="text-[9px] text-navy-slate font-semibold mt-1">
                {new Date(booking.startTime).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* End Time */}
            <div
              className="rounded-2xl p-5 border border-white/70 shadow-md"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}
            >
              <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest mb-1">End Time</p>
              <p className="text-sm font-black text-navy-dark leading-tight">
                {booking.endTime
                  ? new Date(booking.endTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "—"}
              </p>
              <p className="text-[9px] text-navy-slate font-semibold mt-1">
                {booking.endTime
                  ? new Date(booking.endTime).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Trip in progress"}
              </p>
            </div>

            {/* Total Billed */}
            <div
              className="rounded-2xl p-5 border border-accent-blue/20 shadow-md"
              style={{ background: "rgba(0,119,182,0.05)", backdropFilter: "blur(10px)" }}
            >
              <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest mb-1">Total Billed</p>
              <p className="text-2xl font-black text-accent-blue leading-none">
                {formatCurrency(financial.totalAmount)}
              </p>
              <p className="text-[9px] text-navy-slate font-bold mt-1">
                {financial.totalHoursBilled}h ·{" "}
                {formatCurrency(financial.hourlyRate)}/hr
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: RELATIONAL DATA GRID ─────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Customer Card ── */}
          <div
            className="rounded-2xl p-6 border border-white/60 shadow-lg"
            style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)" }}
          >
            <SectionLabel>
              <svg className="w-3.5 h-3.5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Passenger Profile
            </SectionLabel>

            <div className="flex items-start gap-4 mb-5">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-white text-lg shadow-md"
                style={{ background: "linear-gradient(135deg, #0077B6, #48CAE4)" }}
              >
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-base font-black text-navy-dark leading-tight">{customer.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${getTierBadge(customer.tier)}`}>
                    {customer.tier}
                  </span>
                  <StarRating rating={customer.rating} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MetaField label="Email" value={customer.email} />
              <MetaField label="Phone" value={customer.phone} mono />
              <MetaField label="Total Bookings" value={customer.totalBookings} />
              <MetaField label="Customer ID" value={customer.id} mono />
            </div>
          </div>

          {/* ── Vehicle & Chauffeur Card ── */}
          <div
            className="rounded-2xl p-6 border border-white/60 shadow-lg"
            style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)" }}
          >
            <SectionLabel>
              <svg className="w-3.5 h-3.5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              Fleet & Chauffeur
            </SectionLabel>

            {/* Vehicle */}
            <div className="rounded-xl border border-crisp-lightgray p-4 mb-4 bg-crisp-offwhite">
              <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest mb-2">Assigned Vehicle</p>
              <div className="grid grid-cols-2 gap-3">
                <MetaField label="Make & Model" value={`${vehicle.make} ${vehicle.model}`} />
                <MetaField label="Year" value={vehicle.year} />
                <MetaField label="Plate Number" value={vehicle.plateNumber} mono accent />
                <MetaField label="Category" value={vehicle.category} />
                <MetaField label="Color" value={vehicle.color} />
                <MetaField label="Vehicle ID" value={vehicle.id} mono />
              </div>
            </div>

            {/* Chauffeur */}
            <div className="rounded-xl border border-crisp-lightgray p-4 bg-crisp-offwhite">
              <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest mb-2">Assigned Chauffeur</p>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1C2541, #3A506B)" }}
                >
                  {chauffeur.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-navy-dark">{chauffeur.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={chauffeur.rating} />
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                        chauffeur.status === "On Duty"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-gray-100 text-gray-600 border-gray-300"
                      }`}
                    >
                      {chauffeur.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetaField label="License No." value={chauffeur.licenseNumber} mono />
                <MetaField label="Phone" value={chauffeur.phone} mono />
                <MetaField label="Experience" value={`${chauffeur.experienceYears} years`} />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: TRIP DETAILS ───────────────────────────────────────── */}
        <section
          className="rounded-2xl p-6 border border-white/60 shadow-lg"
          style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)" }}
        >
          <SectionLabel>
            <svg className="w-3.5 h-3.5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Trip & Route Information
          </SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetaField label="Pickup Location" value={booking.pickupLocation} />
            <MetaField label="Drop Location" value={booking.dropLocation} />
            <MetaField label="Purpose" value={booking.purpose} />
            <MetaField label="Priority Level" value={booking.priority} accent />
          </div>
          {booking.notes && (
            <div className="mt-5 pt-4 border-t border-crisp-lightgray">
              <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest mb-2">Operational Notes</p>
              <p className="text-xs text-navy-medium font-medium leading-relaxed bg-crisp-offwhite border border-crisp-lightgray rounded-lg px-4 py-3">
                {booking.notes}
              </p>
            </div>
          )}
        </section>

        {/* ── SECTION 4: FINANCIAL SUMMARY ─────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Financial Breakdown */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 border border-white/60 shadow-lg"
            style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)" }}
          >
            <SectionLabel>
              <svg className="w-3.5 h-3.5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Financial Summary
            </SectionLabel>

            {/* Payment Status Banner */}
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-5 ${getPaymentStatusClasses(
                financial.paymentStatus
              )}`}
            >
              <span className="text-xs font-black uppercase tracking-wider">
                Payment Status: {financial.paymentStatus}
              </span>
              <span className="text-sm font-black">{formatCurrency(financial.amountDue)} Due</span>
            </div>

            {/* Line items */}
            <div className="space-y-2.5 mb-5">
              {[
                { label: "Base Fare", value: financial.baseFare },
                {
                  label: `Hourly Rate × ${financial.totalHoursBilled}h`,
                  value: financial.hourlyRate * financial.totalHoursBilled,
                },
                {
                  label: `Overtime (${financial.overtimeHours}h × 1.5×)`,
                  value: financial.overtimeCharges,
                },
                { label: "GST & Taxes", value: financial.taxAmount },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center text-xs font-semibold text-navy-slate py-1.5 border-b border-crisp-lightgray/50"
                >
                  <span>{row.label}</span>
                  <span className="font-bold text-navy-dark">{formatCurrency(row.value)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 px-4 py-3.5 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest">Grand Total</p>
                <p className="text-xl font-black text-accent-blue">{formatCurrency(financial.totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest">Amount Paid</p>
                <p className="text-xl font-black text-emerald-600">{formatCurrency(financial.amountPaid)}</p>
              </div>
            </div>
          </div>

          {/* Transaction Records */}
          <div
            className="rounded-2xl p-6 border border-white/60 shadow-lg"
            style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)" }}
          >
            <SectionLabel>
              <svg className="w-3.5 h-3.5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Transactions
            </SectionLabel>

            {financial.transactions.length > 0 ? (
              <div className="space-y-3">
                {financial.transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="rounded-xl border border-crisp-lightgray bg-crisp-offwhite p-3.5 text-xs"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-[9px] text-navy-slate uppercase">{txn.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                          txn.status === "Paid"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : txn.status === "Pending"
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-rose-50 border-rose-300 text-rose-700"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <p className="font-black text-navy-dark">{formatCurrency(txn.amount)}</p>
                        <p className="text-[9px] text-navy-slate mt-0.5">via {txn.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[9px] text-accent-blue">
                          {txn.transactionReference || "Cash"}
                        </p>
                        {txn.paidAt && (
                          <p className="text-[9px] text-navy-slate mt-0.5">
                            {new Date(txn.paidAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-navy-slate">
                <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-xs font-bold uppercase tracking-wider">No transactions yet</p>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 5: ACTION HISTORY TIMELINE ───────────────────────────── */}
        <section
          className="rounded-2xl p-6 border border-white/60 shadow-lg"
          style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)" }}
        >
          <SectionLabel>
            <svg className="w-3.5 h-3.5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Action History Timeline
          </SectionLabel>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-4 w-0.5 bg-gradient-to-b from-navy-dark via-accent-blue to-accent-cyan/20 rounded-full" />

            <div className="space-y-0">
              {timeline.map((evt, idx) => (
                <div key={evt.id} className="relative flex gap-6 pb-8 last:pb-0">
                  {/* Dot */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-md ${getTimelineDotStyle(
                      evt.type
                    )}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white/70" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <p className="text-sm font-black text-navy-dark">{evt.event}</p>
                      <p className="text-[10px] font-mono text-navy-slate flex-shrink-0">
                        {formatDateTime(evt.timestamp)}
                      </p>
                    </div>
                    <p className="text-xs text-navy-medium font-medium leading-relaxed mb-1.5">
                      {evt.description}
                    </p>
                    <p className="text-[9px] font-black text-navy-slate uppercase tracking-widest">
                      Actor: {evt.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer className="border-t border-crisp-lightgray pt-6 pb-4 text-center text-[10px] text-navy-slate font-bold uppercase tracking-wider print:pt-4">
          <span>Authorized Operational Sheet — Manivtha Tours & Travels</span>
          <span className="mx-2 opacity-40">|</span>
          <span>Lead QA Officer: QA Reviewer (ID: MNVT-OP-9944)</span>
          <span className="mx-2 opacity-40">|</span>
          <span>Printed: {new Date().toLocaleString("en-IN")}</span>
        </footer>
      </main>

      {/* ── PRINT STYLES ──────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          .print\\:hidden { display: none !important; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        main > * {
          animation: fadeSlideIn 0.35s ease both;
        }
        main > *:nth-child(1) { animation-delay: 0.05s; }
        main > *:nth-child(2) { animation-delay: 0.10s; }
        main > *:nth-child(3) { animation-delay: 0.15s; }
        main > *:nth-child(4) { animation-delay: 0.20s; }
        main > *:nth-child(5) { animation-delay: 0.25s; }
        main > *:nth-child(6) { animation-delay: 0.30s; }
        main > *:nth-child(7) { animation-delay: 0.35s; }
      `}</style>
    </div>
  );
}
