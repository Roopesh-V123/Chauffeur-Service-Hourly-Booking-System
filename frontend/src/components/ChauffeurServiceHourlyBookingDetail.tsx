"use client";

import React, { useState, useEffect } from "react";
import { BookingDetailSkeleton } from "./FeedbackStates";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 20: Comprehensive Booking Detail View
// Aesthetic: Navy Blue and Crisp White (70% structural / 30% logic)

interface PaymentRecord {
  id: string;
  amount: number | string;
  status: "Pending" | "Paid" | "Failed";
  transactionReference?: string | null;
  createdAt: string;
}

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface VehicleRecord {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  category: string;
}

interface JoinedBookingRecord {
  id: string;
  liveMeterAndBilling: number;
  status: "Active" | "Completed" | "Cancelled";
  createdDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerRecord | null;
  vehicle?: VehicleRecord | null;
  payments: PaymentRecord[];
}

interface DetailProps {
  bookingId: string;
  onBack: () => void;
}

export default function ChauffeurServiceHourlyBookingDetail({ bookingId, onBack }: DetailProps) {
  const [booking, setBooking] = useState<JoinedBookingRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Mock fallbacks to test complete data vs empty states (Day 20 requirements)
  const mockDetailComplete: JoinedBookingRecord = {
    id: bookingId,
    liveMeterAndBilling: 7200,
    status: "Completed",
    createdDate: "2026-06-08",
    notes: "Completed airport transport. High priority corporate passenger QA Reviewer (ID: MNVT-OP-9944).",
    createdAt: "2026-06-08T14:30:00Z",
    updatedAt: "2026-06-08T18:45:00Z",
    customer: {
      id: "cust-1234-abcd",
      name: "Lead Operator",
      email: "operator@manivtha.com",
      phone: "MNVT-OP-9944"
    },
    vehicle: {
      id: "veh-5678-efgh",
      make: "Toyota",
      model: "Innova Crysta",
      plateNumber: "AP-09-XX-1234",
      category: "Luxury SUV"
    },
    payments: [
      {
        id: "pay-1",
        amount: 5000.00,
        status: "Paid",
        transactionReference: "TXN-UPI-9944",
        createdAt: "2026-06-08T18:50:00Z"
      },
      {
        id: "pay-2",
        amount: 2200.00,
        status: "Pending",
        transactionReference: null,
        createdAt: "2026-06-08T18:55:00Z"
      }
    ]
  };

  const mockDetailEmptyRelations: JoinedBookingRecord = {
    id: bookingId,
    liveMeterAndBilling: 4800,
    status: "Active",
    createdDate: "2026-06-09",
    notes: "No customer info linked. Walk-in tourist service.",
    createdAt: "2026-06-09T10:15:00Z",
    updatedAt: "2026-06-09T10:15:00Z",
    customer: null,
    vehicle: null,
    payments: []
  };

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://chauffeur-service-hourly-booking-system.onrender.com/api/chauffeur_service_hourly_booking/${bookingId}/detail`
        );
        if (!response.ok) throw new Error("Fetch failed");
        const json = await response.json();
        if (json.success && json.data) {
          setBooking(json.data);
          setErrorState(null);
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        console.warn("[Detail] API offline, loading mock template values.");
        // Fallback to mock data. If ID contains "empty", we show empty relations to test empty states.
        if (bookingId.includes("empty")) {
          setBooking(mockDetailEmptyRelations);
        } else {
          setBooking(mockDetailComplete);
        }
        setErrorState("Backend API offline. Displaying simulated offline specifications.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <BookingDetailSkeleton />;
  }

  if (!booking) {
    return (
      <div className="bg-crisp-white border border-crisp-lightgray rounded-2xl p-12 shadow-lg text-center">
        <p className="text-sm font-bold text-rose-600 mb-4">
          Error: Booking record specifications could not be loaded.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-navy-dark text-crisp-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-accent-blue transition-colors"
        >
          Return to Monitor
        </button>
      </div>
    );
  }

  return (
    <div className="bg-crisp-white border border-crisp-lightgray rounded-2xl shadow-xl p-8 max-w-full lg:max-w-5xl mx-auto transition-all duration-300 print:shadow-none print:border-none print:p-0">
      
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-crisp-lightgray pb-6 mb-8 gap-4 print:mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-black text-navy-slate hover:text-accent-blue uppercase tracking-wider mb-2 flex items-center gap-1.5 transition-colors print:hidden"
          >
            ← Back to operational list
          </button>
          <h2 className="text-2xl font-black text-navy-dark tracking-tight leading-none">
            Detailed Booking Specification Sheet
          </h2>
          <p className="text-[10px] text-navy-slate font-black uppercase tracking-wider mt-2">
            Reference ID: <span className="font-mono text-accent-blue">{booking.id}</span>
          </p>
        </div>

        {/* Print/Export Button */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-crisp-white hover:bg-navy-dark hover:text-crisp-white text-navy-dark border-2 border-navy-dark font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Export Details
          </button>
        </div>
      </div>

      {/* Offline Indicator Alert */}
      {errorState && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg mb-8 text-xs font-semibold print:hidden">
          ⚠️ {errorState}
        </div>
      )}

      {/* Grid Specification Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Core Details & Vehicle */}
        <div className="md:col-span-2 space-y-8">
          {/* Core Info */}
          <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-xl p-6">
            <h3 className="text-sm font-black text-navy-dark uppercase tracking-wider border-b border-crisp-lightgray pb-2.5 mb-4">
              Core Booking Specifications
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-semibold">
              <div>
                <span className="text-navy-slate block mb-1">Meter Hours Status</span>
                <span className="text-lg font-black text-accent-blue">₹{booking.liveMeterAndBilling.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-navy-slate block mb-1">Status Classification</span>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${
                  booking.status === "Active"
                    ? "bg-accent-cyan/10 text-navy-dark border-accent-cyan/40"
                    : booking.status === "Completed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}>
                  {booking.status}
                </span>
              </div>
              <div>
                <span className="text-navy-slate block mb-1">Billed Travel Date</span>
                <span className="text-navy-dark font-bold">{booking.createdDate}</span>
              </div>
              <div>
                <span className="text-navy-slate block mb-1">System Timestamp</span>
                <span className="text-navy-dark font-mono text-[10px]">
                  {new Date(booking.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-crisp-lightgray/50 text-xs">
              <span className="text-navy-slate block font-bold mb-1.5">Operational Remarks</span>
              <p className="p-3 bg-crisp-white border border-crisp-lightgray rounded-lg text-navy-medium leading-relaxed font-medium">
                {booking.notes || "No operational notes recorded."}
              </p>
            </div>
          </div>

          {/* Customer Specification Section */}
          <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-xl p-6">
            <h3 className="text-sm font-black text-navy-dark uppercase tracking-wider border-b border-crisp-lightgray pb-2.5 mb-4">
              Passenger customer Specifications
            </h3>
            
            {booking.customer ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-navy-slate block mb-0.5">Name</span>
                  <span className="text-navy-dark font-black">{booking.customer.name}</span>
                </div>
                <div>
                  <span className="text-navy-slate block mb-0.5">Email</span>
                  <span className="text-navy-dark">{booking.customer.email}</span>
                </div>
                <div>
                  <span className="text-navy-slate block mb-0.5">Contact</span>
                  <span className="text-navy-dark font-mono">{booking.customer.phone}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-navy-slate text-xs font-bold uppercase tracking-wider">
                ⚠️ No customer records linked to this booking.
              </div>
            )}
          </div>

          {/* Vehicle Specifications */}
          <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-xl p-6">
            <h3 className="text-sm font-black text-navy-dark uppercase tracking-wider border-b border-crisp-lightgray pb-2.5 mb-4">
              Assigned Fleet Specifications
            </h3>
            
            {booking.vehicle ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-navy-slate block mb-0.5">Vehicle Make</span>
                  <span className="text-navy-dark font-black">{booking.vehicle.make}</span>
                </div>
                <div>
                  <span className="text-navy-slate block mb-0.5">Model Variant</span>
                  <span className="text-navy-dark">{booking.vehicle.model}</span>
                </div>
                <div>
                  <span className="text-navy-slate block mb-0.5">License Plate</span>
                  <span className="text-navy-dark font-mono font-bold">{booking.vehicle.plateNumber}</span>
                </div>
                <div>
                  <span className="text-navy-slate block mb-0.5">Category</span>
                  <span className="text-accent-blue">{booking.vehicle.category}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-navy-slate text-xs font-bold uppercase tracking-wider">
                ⚠️ No vehicle assignments linked.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Payments & History Timeline */}
        <div className="space-y-8">
          
          {/* Payments Specifications */}
          <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-xl p-6">
            <h3 className="text-sm font-black text-navy-dark uppercase tracking-wider border-b border-crisp-lightgray pb-2.5 mb-4">
              Payment Receipts
            </h3>

            {booking.payments && booking.payments.length > 0 ? (
              <div className="space-y-4">
                {booking.payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-crisp-white border border-crisp-lightgray rounded-lg p-3 text-xs font-semibold flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-navy-slate font-mono text-[9px] uppercase">ID: {p.id.slice(0,8)}</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black border ${
                        p.status === "Paid"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : p.status === "Pending"
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "bg-rose-50 border-rose-300 text-rose-700"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-navy-slate">Reference: {p.transactionReference || "Cash"}</span>
                      <span className="text-navy-dark font-black">₹{Number(p.amount).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-navy-slate text-xs font-bold uppercase tracking-wider">
                💸 No payment records generated yet.
              </div>
            )}
          </div>

          {/* Action History Timeline */}
          <div className="bg-crisp-offwhite border border-crisp-lightgray rounded-xl p-6">
            <h3 className="text-sm font-black text-navy-dark uppercase tracking-wider border-b border-crisp-lightgray pb-2.5 mb-4">
              System Audit Logs
            </h3>

            <div className="relative border-l-2 border-crisp-lightgray ml-2.5 pl-6 space-y-6 text-xs font-semibold">
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 bg-accent-blue w-2 h-2 rounded-full border-2 border-accent-blue" />
                <span className="text-navy-slate text-[9px] block">
                  {new Date(booking.createdAt).toLocaleString("en-IN")}
                </span>
                <span className="text-navy-dark block mt-0.5">Booking entry created in DB</span>
              </div>
              
              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 bg-accent-cyan w-2 h-2 rounded-full border-2 border-accent-cyan" />
                <span className="text-navy-slate text-[9px] block">
                  {new Date(booking.updatedAt).toLocaleString("en-IN")}
                </span>
                <span className="text-navy-dark block mt-0.5">System records specifications checked</span>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 bg-navy-dark w-2 h-2 rounded-full border-2 border-navy-dark" />
                <span className="text-navy-slate text-[9px] block">
                  {booking.status === "Completed" ? "Trip closed" : booking.status === "Cancelled" ? "Trip cancelled" : "Trip actively running"}
                </span>
                <span className="text-navy-dark block mt-0.5">Status marker classification set to {booking.status}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sheet Footer */}
      <div className="mt-8 border-t border-crisp-lightgray pt-6 text-center text-[10px] text-navy-slate font-bold uppercase tracking-wider">
        <span>Authorized operational sheet — Manivtha Tours & Travels</span>
        <span className="mx-2">|</span>
        <span>Lead QA Officer: QA Reviewer (ID: MNVT-OP-9944)</span>
      </div>

    </div>
  );
}
