"use client";

import React, { useState, useEffect } from "react";
import { PaymentTrackerSkeleton } from "./FeedbackStates";
import { API_BASE_URL } from "@/app/api";

/**
 * @component PaymentBillingTracker
 * @description Interactive payment processing component. Fetches live bookings from the database,
 * allows operator to select a booking, choose payment method, and submit a payment record
 * via the backend API. Displays real-time billing breakdown and submission feedback.
 *
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */

interface BookingRecord {
  id: string;
  liveMeterAndBilling: number;
  status: string;
  createdDate: string;
  notes: string;
  customer?: { name: string } | null;
}

type PaymentMethod = "Cash" | "Card" | "UPI" | "BankTransfer";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  Cash: "Cash",
  Card: "Credit / Debit Card",
  UPI: "UPI Transfer",
  BankTransfer: "Bank Transfer (NEFT/RTGS)",
};

/** Mock fallback bookings when backend API is offline */
const MOCK_BOOKINGS: BookingRecord[] = [
  {
    id: "6f69a2df-ac88-48ad-8730-20586b6bd0a7",
    liveMeterAndBilling: 4800,
    status: "Active",
    createdDate: "2026-06-09",
    notes: "VIP Airport escort — QA Reviewer (ID: MNVT-OP-9944)",
    customer: { name: "Lead Operator" },
  },
  {
    id: "a228fb63-7eb6-4c4f-9e7f-b0f37c3558d2",
    liveMeterAndBilling: 7200,
    status: "Completed",
    createdDate: "2026-06-08",
    notes: "Business route to high-tech hub — Microsoft India",
    customer: { name: "Microsoft India" },
  },
];

export default function PaymentBillingTracker() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [paymentResult, setPaymentResult] = useState<{ id: string; amount: number; method: string } | null>(null);

  /** Fetch bookings from backend on mount */
  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoadingBookings(true);
        const response = await fetch(
          `${API_BASE_URL}/api/chauffeur_service_hourly_booking?limit=50`
        );
        if (!response.ok) throw new Error("API offline");
        const json = await response.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBookings(json.data);
          setSelectedId(json.data[0].id);
          setSelectedBooking(json.data[0]);
          setIsOffline(false);
        } else {
          throw new Error("Empty or invalid response");
        }
      } catch {
        setBookings(MOCK_BOOKINGS);
        setSelectedId(MOCK_BOOKINGS[0].id);
        setSelectedBooking(MOCK_BOOKINGS[0]);
        setIsOffline(true);
      } finally {
        setIsLoadingBookings(false);
      }
    }
    fetchBookings();
  }, []);

  /** Sync selected booking object when dropdown changes */
  const handleBookingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const booking = bookings.find((b) => b.id === id) || null;
    setSelectedBooking(booking);
    setApiError("");
    setPaymentResult(null);
  };

  /** Compute a billing breakdown from the selected booking's meter value */
  const computeBilling = (booking: BookingRecord) => {
    const total = booking.liveMeterAndBilling;
    const gst = Math.round((total / 1.18) * 0.18 * 100) / 100;
    const subtotal = Math.round((total - gst) * 100) / 100;
    const peakSurcharge = Math.round(subtotal * (0.15 / 1.15) * 100) / 100;
    const baseTotal = Math.round((subtotal - peakSurcharge) * 100) / 100;
    return { baseTotal, peakSurcharge, gst, total };
  };

  const billing = selectedBooking ? computeBilling(selectedBooking) : null;

  /** Submit payment via POST /api/payments */
  const handleProcessPayment = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);
    setApiError("");
    setPaymentResult(null);

    try {
      const body: Record<string, unknown> = {
        booking_id: selectedBooking.id,
        amount: selectedBooking.liveMeterAndBilling,
        method,
      };
      if (transactionRef.trim().length >= 3) {
        body.transaction_reference = transactionRef.trim();
      }

      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || json.error || "Payment processing failed.");
      }

      setPaymentResult({
        id: json.data?.id || "",
        amount: json.data?.amount || selectedBooking.liveMeterAndBilling,
        method: json.data?.method || method,
      });
      setTransactionRef("");
    } catch (err: any) {
      setApiError(
        err.message ||
          "Unable to connect to the backend server. Please ensure the service is running on port 5000."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-surface border border-border-color/30 rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl text-foreground">
      {/* Visual Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-active to-accent-pending" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-border-color/30 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-6 bg-accent-active rounded-full" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Payment &amp; Billing Tracker
            </h2>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
              System Lead: Lead Operator | ID: MNVT-OP-9944
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="text-[9px] bg-amber-950/40 text-amber-300 font-bold px-2 py-0.5 rounded uppercase border border-amber-800/40">
              Fallback
            </span>
          )}
          <span className="text-xs font-semibold bg-accent-pending/20 text-accent-pending border border-accent-pending/40 px-3 py-1.5 rounded-full">
            Invoice Processing
          </span>
        </div>
      </div>

      {isLoadingBookings ? (
        <PaymentTrackerSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Booking Selector */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Select Booking Record <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedId}
              onChange={handleBookingChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-background border border-border-color/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active text-foreground text-sm font-semibold cursor-pointer transition-all"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id} className="bg-surface text-foreground">
                  ₹{b.liveMeterAndBilling.toLocaleString("en-IN")} — {b.customer?.name || "Unknown"} ({b.status}) — {new Date(b.createdDate).toLocaleDateString("en-IN")}
                </option>
              ))}
            </select>
            {selectedBooking && (
              <p className="text-[10px] text-muted font-mono mt-1.5">
                UUID: {selectedBooking.id}
              </p>
            )}
          </div>

          {/* Billing Breakdown */}
          {billing && (
            <div className="space-y-3 bg-background rounded-lg p-5 border border-border-color/20">
              <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-3">
                Billing Breakdown
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Base Fare</span>
                <span className="font-semibold text-foreground">₹{billing.baseTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Peak Hour Surcharge (+15%)</span>
                <span className="font-semibold text-foreground">₹{billing.peakSurcharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border-color/20 pt-3">
                <span className="text-muted">GST Tax (18%)</span>
                <span className="font-semibold text-foreground">₹{billing.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border-color/20 pt-3">
                <span className="text-foreground font-black">Total Amount</span>
                <span className="text-xl font-black text-foreground">₹{billing.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setMethod(m)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                    method === m
                      ? "bg-accent-active text-white border-accent-active shadow-md"
                      : "bg-navy-light text-foreground border-border-color/30 hover:bg-surface-light"
                  }`}
                >
                  {PAYMENT_METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Reference (optional) */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Transaction Reference{" "}
              <span className="text-muted font-normal normal-case">(optional, min 3 chars)</span>
            </label>
            <input
              type="text"
              value={transactionRef}
              disabled={isSubmitting}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. TXN-UPI-9944, NEFT-REF-001..."
              className="w-full px-4 py-3 bg-background border border-border-color/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active text-foreground text-sm font-semibold placeholder-muted transition-all"
            />
          </div>

          {/* API Error */}
          {apiError && (
            <div className="p-4 bg-rose-950/20 border border-rose-800/40 text-rose-300 rounded-lg text-xs font-semibold flex items-start gap-2.5">
              <span className="text-sm">⚠️</span>
              <div>
                <p className="font-extrabold text-rose-200">Payment Processing Failed</p>
                <p className="mt-0.5 text-rose-400">{apiError}</p>
              </div>
            </div>
          )}

          {/* Payment Success */}
          {paymentResult && (
            <div className="p-5 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-xs text-emerald-300 animate-fadeIn">
              <p className="font-extrabold flex items-center mb-2 text-emerald-200">
                <span className="mr-2">✓</span> Payment Record Created Successfully
              </p>
              <ul className="space-y-1 font-semibold text-emerald-400">
                <li>
                  <strong>Payment UUID:</strong>{" "}
                  <span className="font-mono bg-navy-light px-1.5 py-0.5 rounded text-[10px] border border-border-color/30 text-foreground">
                    {paymentResult.id}
                  </span>
                </li>
                <li>
                  <strong>Amount Processed:</strong> ₹{Number(paymentResult.amount).toLocaleString("en-IN")}
                </li>
                <li>
                  <strong>Payment Method:</strong> {paymentResult.method}
                </li>
                <li>
                  <strong>Status:</strong> Pending (awaiting confirmation)
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.print()}
              disabled={isSubmitting}
              className="py-3 bg-navy-light hover:bg-surface-light text-foreground font-bold rounded-lg border border-border-color/30 transition-all text-sm"
            >
              Print Invoice
            </button>
            <button
              onClick={handleProcessPayment}
              disabled={isSubmitting || !selectedBooking}
              className={`py-3 font-bold rounded-lg shadow-md transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                isSubmitting || !selectedBooking
                  ? "bg-accent-active/60 text-white/80 cursor-not-allowed"
                  : "bg-accent-active hover:bg-accent-active/85 text-white cursor-pointer"
              }`}
            >
              {isSubmitting ? "Processing..." : "Process Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
