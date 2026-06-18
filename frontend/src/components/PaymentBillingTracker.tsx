"use client";

import React, { useState, useEffect } from "react";

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
          "https://chauffeur-service-hourly-booking-system.onrender.com/api/chauffeur_service_hourly_booking?limit=50"
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

      const response = await fetch("https://chauffeur-service-hourly-booking-system.onrender.com/api/payments", {
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
    <div className="relative overflow-hidden bg-crisp-white border border-crisp-lightgray rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
      {/* Visual Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-medium to-accent-blue" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-crisp-lightgray pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-6 bg-accent-blue rounded-full" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-navy-dark tracking-tight">
              Payment &amp; Billing Tracker
            </h2>
            <p className="text-[10px] text-navy-slate font-bold uppercase tracking-wider mt-0.5">
              System Lead: Lead Operator | ID: MNVT-OP-9944
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase border border-amber-200">
              Fallback
            </span>
          )}
          <span className="text-xs font-semibold bg-accent-gold/20 text-navy-dark border border-accent-gold/50 px-3 py-1.5 rounded-full">
            Invoice Processing
          </span>
        </div>
      </div>

      {isLoadingBookings ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-navy-slate uppercase tracking-widest">
            Loading bookings...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Booking Selector */}
          <div>
            <label className="block text-xs font-bold text-navy-medium uppercase tracking-wider mb-2">
              Select Booking Record <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedId}
              onChange={handleBookingChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-crisp-offwhite/50 border border-crisp-lightgray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue text-navy-dark text-sm font-semibold cursor-pointer transition-all"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  ₹{b.liveMeterAndBilling.toLocaleString("en-IN")} — {b.customer?.name || "Unknown"} ({b.status}) — {new Date(b.createdDate).toLocaleDateString("en-IN")}
                </option>
              ))}
            </select>
            {selectedBooking && (
              <p className="text-[10px] text-navy-slate font-mono mt-1.5">
                UUID: {selectedBooking.id}
              </p>
            )}
          </div>

          {/* Billing Breakdown */}
          {billing && (
            <div className="space-y-3 bg-crisp-offwhite rounded-lg p-5 border border-crisp-lightgray">
              <p className="text-[10px] font-black text-navy-slate uppercase tracking-wider mb-3">
                Billing Breakdown
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-navy-slate">Base Fare</span>
                <span className="font-semibold text-navy-dark">₹{billing.baseTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-slate">Peak Hour Surcharge (+15%)</span>
                <span className="font-semibold text-navy-dark">₹{billing.peakSurcharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-crisp-lightgray pt-3">
                <span className="text-navy-slate">GST Tax (18%)</span>
                <span className="font-semibold text-navy-dark">₹{billing.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-crisp-lightgray pt-3">
                <span className="text-navy-dark font-black">Total Amount</span>
                <span className="text-xl font-black text-navy-dark">₹{billing.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-navy-medium uppercase tracking-wider mb-2">
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
                      ? "bg-navy-dark text-crisp-white border-navy-dark shadow-md"
                      : "bg-crisp-offwhite text-navy-dark border-crisp-lightgray hover:bg-crisp-lightgray/50"
                  }`}
                >
                  {PAYMENT_METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Reference (optional) */}
          <div>
            <label className="block text-xs font-bold text-navy-medium uppercase tracking-wider mb-2">
              Transaction Reference{" "}
              <span className="text-navy-slate font-normal normal-case">(optional, min 3 chars)</span>
            </label>
            <input
              type="text"
              value={transactionRef}
              disabled={isSubmitting}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. TXN-UPI-9944, NEFT-REF-001..."
              className="w-full px-4 py-3 bg-crisp-offwhite/50 border border-crisp-lightgray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue text-navy-dark text-sm font-semibold placeholder-navy-slate transition-all"
            />
          </div>

          {/* API Error */}
          {apiError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-start gap-2.5">
              <span className="text-sm">⚠️</span>
              <div>
                <p className="font-extrabold text-rose-900">Payment Processing Failed</p>
                <p className="mt-0.5 text-rose-700">{apiError}</p>
              </div>
            </div>
          )}

          {/* Payment Success */}
          {paymentResult && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 animate-fadeIn">
              <p className="font-extrabold flex items-center mb-2 text-emerald-800">
                <span className="mr-2">✓</span> Payment Record Created Successfully
              </p>
              <ul className="space-y-1 font-semibold text-emerald-800">
                <li>
                  <strong>Payment UUID:</strong>{" "}
                  <span className="font-mono bg-emerald-100/60 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200">
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
              className="py-3 bg-crisp-offwhite hover:bg-crisp-lightgray text-navy-medium font-bold rounded-lg border border-crisp-lightgray transition-all text-sm"
            >
              Print Invoice
            </button>
            <button
              onClick={handleProcessPayment}
              disabled={isSubmitting || !selectedBooking}
              className={`py-3 font-bold rounded-lg shadow-md transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                isSubmitting || !selectedBooking
                  ? "bg-navy-medium/60 text-crisp-white/80 cursor-not-allowed"
                  : "bg-navy-medium hover:bg-navy-dark text-crisp-white cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                "Process Payment"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
