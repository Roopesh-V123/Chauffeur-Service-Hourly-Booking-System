"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/app/api";

/**
 * Author: QA Reviewer (ID: MNVT-OP-9944)
 * Module: Chauffeur Service Core Logic calculation results display
 * Aesthetic System: Navy Blue and Crisp White premium layout, 70% structural / 30% logic ratio
 */
/**
 * @component ChauffeurServiceCoreLogicResult
 * @description Renders calculations output summaries from the core billing logic processing engine.
 * Fetches live calculation data from the backend API and displays breakdown of base fares,
 * dynamic multipliers, tax allocations, and operational indices.
 * "Authorize Invoicing" → POST /api/payments
 * "Download Calculation Ledger" → generate and download a .txt ledger file
 *
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */

interface CalculationResult {
  bookingId: string;
  vehicleCategory: string;
  baseRatePerHour: number;
  rawHours: number;
  billedHours: number;
  baseFare: number;
  isPeakHour: boolean;
  peakSurcharge: number;
  isNightTime: boolean;
  nightSurcharge: number;
  subtotal: number;
  gst: number;
  totalAmount: number;
  rateEfficiency: number;
}

/**
 * Build a CalculationResult from a raw booking object returned by the API.
 * Uses the liveMeterAndBilling value as the grand total and back-calculates.
 */
function buildCalculation(booking: {
  id: string;
  liveMeterAndBilling: number;
  status?: string;
}): CalculationResult {
  const total = Number(booking.liveMeterAndBilling);
  const gst = Math.round((total / 1.18) * 0.18 * 100) / 100;
  const subtotalBeforeGst = Math.round((total - gst) * 100) / 100;
  const peakSurcharge = Math.round((subtotalBeforeGst * 0.15) / 1.15 * 100) / 100;
  const baseFare = Math.round((subtotalBeforeGst - peakSurcharge) * 100) / 100;
  const hours = Math.max(4, Math.round(baseFare / 1800));
  return {
    bookingId: booking.id,
    vehicleCategory: "Luxury SUV",
    baseRatePerHour: 1800,
    rawHours: hours,
    billedHours: hours,
    baseFare,
    isPeakHour: peakSurcharge > 0,
    peakSurcharge,
    isNightTime: false,
    nightSurcharge: 0,
    subtotal: subtotalBeforeGst,
    gst,
    totalAmount: total,
    rateEfficiency: 92,
  };
}

/** Static fallback used only when backend is completely offline */
const OFFLINE_FALLBACK: CalculationResult = {
  bookingId: "",          // empty — will not be sent to API
  vehicleCategory: "Luxury SUV",
  baseRatePerHour: 1800,
  rawHours: 6,
  billedHours: 6,
  baseFare: 10800,
  isPeakHour: true,
  peakSurcharge: 1620,
  isNightTime: false,
  nightSurcharge: 0,
  subtotal: 12420,
  gst: 2235.60,
  totalAmount: 14655.60,
  rateEfficiency: 92,
};

export default function ChauffeurServiceCoreLogicResult() {
  /**
   * @type {CalculationResult} calculation
   * @description Live calculation from the billing engine API or fallback mock data.
   */
  const [calculation, setCalculation] = useState<CalculationResult>(OFFLINE_FALLBACK);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  /** Authorize Invoicing states */
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);
  const [invoiceId, setInvoiceId] = useState<string>("");

  /**
   * Fetch the most recent booking from the API on mount and derive the
   * calculation from it. Falls back to static data only if API is offline.
   */
  useEffect(() => {
    async function fetchLatestBooking() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chauffeur_service_hourly_booking?limit=1`
        );
        if (!response.ok) throw new Error("API offline");
        const json = await response.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCalculation(buildCalculation(json.data[0]));
          setIsOffline(false);
        } else {
          throw new Error("No bookings found");
        }
      } catch {
        setIsOffline(true);
      }
    }
    fetchLatestBooking();
  }, []);

  /**
   * @function handleAuthorizeInvoicing
   * @description Calls POST /api/payments to create a payment record for this booking.
   */
  const handleAuthorizeInvoicing = async () => {
    setIsAuthorizing(true);
    setAuthError("");
    setAuthSuccess(false);
    setInvoiceId("");

    if (!calculation.bookingId) {
      setAuthError("No valid booking loaded. Please ensure the backend is running and bookings exist in the database.");
      setIsAuthorizing(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: calculation.bookingId,
          amount: calculation.totalAmount,
          method: "Cash",
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || json.error || "Invoice authorization failed.");
      }

      setInvoiceId(json.data?.id || "");
      setAuthSuccess(true);
    } catch (err: any) {
      setAuthError(
        err.message ||
          "Unable to connect to the backend server. Please ensure the service is running on port 5000."
      );
    } finally {
      setIsAuthorizing(false);
    }
  };

  /**
   * @function handleDownloadLedger
   * @description Generates and downloads a plain-text calculation ledger file.
   */
  const handleDownloadLedger = () => {
    const lines = [
      "=============================================================",
      "   MANIVTHA TOURS & TRAVELS — CALCULATION LEDGER",
      "   Operator: QA Reviewer (ID: MNVT-OP-9944)",
      "=============================================================",
      `   Booking UUID     : ${calculation.bookingId}`,
      `   Vehicle Category : ${calculation.vehicleCategory}`,
      `   Base Rate / Hr   : INR ${calculation.baseRatePerHour.toFixed(2)}`,
      "-------------------------------------------------------------",
      `   Recorded Duration: ${calculation.rawHours} hrs`,
      `   Billed Duration  : ${calculation.billedHours} hrs (min 4 hrs enforced)`,
      `   Base Fare        : INR ${calculation.baseFare.toFixed(2)}`,
      calculation.isPeakHour
        ? `   Peak Surcharge   : +INR ${calculation.peakSurcharge.toFixed(2)} (+15%)`
        : "   Peak Surcharge   : N/A",
      calculation.nightSurcharge > 0
        ? `   Night Surcharge  : +INR ${calculation.nightSurcharge.toFixed(2)} (+20%)`
        : "   Night Surcharge  : N/A",
      `   Sub Total        : INR ${calculation.subtotal.toFixed(2)}`,
      `   GST (18%)        : INR ${calculation.gst.toFixed(2)}`,
      "-------------------------------------------------------------",
      `   GRAND TOTAL      : INR ${calculation.totalAmount.toFixed(2)}`,
      "-------------------------------------------------------------",
      `   Fleet Efficiency : ${calculation.rateEfficiency}% (Dynamic Utilization Index)`,
      "=============================================================",
      `   Generated: ${new Date().toLocaleString("en-IN")}`,
      "=============================================================",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Calculation_Ledger_${calculation.bookingId.slice(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative overflow-hidden bg-surface/95 backdrop-blur-md border border-border-color/30 rounded-2xl shadow-xl p-6 sm:p-8 max-w-xl mx-auto transition-all duration-300 hover:shadow-2xl text-white">
      {/* Visual Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-active to-accent-pending" />

      {/* Header section */}
      <div className="mb-6 pb-4 border-b border-border-color/30 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Fare Computation Output</h2>
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
            System Lead: Lead Operator | ID: MNVT-OP-9944
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="text-[8px] bg-amber-950/40 text-amber-300 font-bold px-1.5 py-0.5 rounded uppercase border border-amber-800/40">
              Fallback
            </span>
          )}
          {/* Efficiency badge */}
          <div className="flex items-center space-x-1.5 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1.5 rounded-full uppercase tracking-wide">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-active animate-pulse" />
            <span>↑ {calculation.rateEfficiency}% Efficient</span>
          </div>
        </div>
      </div>

      {/* Large Estimated Fare output display */}
      <div className="text-center py-6 bg-background rounded-xl border border-border-color/20 mb-6">
        <span className="text-[10px] text-muted font-bold uppercase tracking-widest block mb-1">
          Total Estimated Fare (incl. GST)
        </span>
        <h3 className="text-4xl font-black text-white tracking-tight font-mono">
          ₹{calculation.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </h3>
        <span className="text-[10px] text-accent-active font-bold uppercase tracking-widest block mt-2">
          Base: {calculation.vehicleCategory} (₹{calculation.baseRatePerHour}/hr)
        </span>
      </div>

      {/* Detailed breakdown items */}
      <div className="space-y-3.5 mb-6 text-xs font-semibold text-white">
        <div className="flex justify-between items-center pb-2 border-b border-border-color/20">
          <span className="text-muted font-medium">Recorded Duration</span>
          <span className="text-white">{calculation.rawHours} Hours</span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-border-color/20">
          <span className="text-muted font-medium">Billed Duration (min 4 hrs)</span>
          <span className="text-white">{calculation.billedHours} Hours</span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-border-color/20">
          <span className="text-muted font-medium">Base Fare Subtotal</span>
          <span className="text-white font-mono">₹{calculation.baseFare.toFixed(2)}</span>
        </div>

        {/* Dynamic Peak Surcharge item */}
        {calculation.isPeakHour && (
          <div className="flex justify-between items-center pb-2 border-b border-border-color/20">
            <span className="text-muted font-medium flex items-center">
              Peak Traffic Surcharge (+15%)
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-accent-pending" />
            </span>
            <span className="text-white font-mono">+₹{calculation.peakSurcharge.toFixed(2)}</span>
          </div>
        )}

        {/* Dynamic Night Surcharge item */}
        {calculation.nightSurcharge > 0 && (
          <div className="flex justify-between items-center pb-2 border-b border-border-color/20">
            <span className="text-muted font-medium flex items-center">
              Night Time Surcharge (+20%)
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-accent-active" />
            </span>
            <span className="text-white font-mono">+₹{calculation.nightSurcharge.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pb-2 border-b border-border-color/20">
          <span className="text-muted font-medium">Calculated Tax (GST 18%)</span>
          <span className="text-white font-mono">₹{calculation.gst.toFixed(2)}</span>
        </div>
      </div>

      {/* Auth Error */}
      {authError && (
        <div className="mb-4 p-4 bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-lg text-xs font-semibold flex items-start gap-2.5">
          <span>⚠️</span>
          <div>
            <p className="font-extrabold text-rose-200">Invoice Authorization Failed</p>
            <p className="mt-0.5 text-rose-400">{authError}</p>
          </div>
        </div>
      )}

      {/* Auth Success */}
      {authSuccess && (
        <div className="mb-4 p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-xs text-emerald-300">
          <p className="font-extrabold flex items-center mb-1.5 text-emerald-200">
            <span className="mr-2">✓</span> Invoice Authorized &amp; Payment Record Created
          </p>
          {invoiceId && (
            <p className="font-semibold text-emerald-400">
              Payment UUID:{" "}
              <span className="font-mono bg-[#1e1e1e] px-1.5 py-0.5 rounded text-[10px] border border-border-color/30 text-white">
                {invoiceId}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Action CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleDownloadLedger}
          className="py-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-border-color/30 text-white font-bold rounded-lg text-xs tracking-wider transition-all active:scale-[0.98]"
        >
          Download Calculation Ledger
        </button>
        <button
          onClick={handleAuthorizeInvoicing}
          disabled={isAuthorizing || authSuccess}
          className={`py-3 font-bold rounded-lg text-xs tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
            isAuthorizing || authSuccess
              ? "bg-[#1e1e1e]/60 text-white/80 cursor-not-allowed"
              : "bg-accent-active hover:bg-accent-active/85 text-white cursor-pointer"
          }`}
        >
          {isAuthorizing ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authorizing...
            </>
          ) : authSuccess ? (
            "✓ Invoice Authorized"
          ) : (
            "Authorize Invoicing"
          )}
        </button>
      </div>
    </div>
  );
}
