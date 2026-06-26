"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/app/api";

/**
 * @module ChauffeurServiceHourlyBookingEditForm
 * @description Modal overlay form for editing an existing booking record.
 * Pre-fills all fields from the selected record and submits via PUT API.
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @aesthetic Navy Blue and Crisp White — 70% structural / 30% logic ratio
 */

interface BookingRecord {
  id: string;
  liveMeterAndBilling: number;
  status: "Active" | "Completed" | "Cancelled";
  createdDate: string;
  notes: string;
}

interface EditFormProps {
  booking: BookingRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChauffeurServiceHourlyBookingEditForm({
  booking,
  onClose,
  onSuccess,
}: EditFormProps) {
  const [formData, setFormData] = useState({
    live_meter_and_billing: booking.liveMeterAndBilling.toString(),
    status: booking.status,
    created_date: booking.createdDate.split("T")[0],
    notes: booking.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  /** Handle input field changes and clear field-level errors */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /** Client-side validation + PUT request to backend API */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const meterValue = Number(formData.live_meter_and_billing);
    if (!formData.live_meter_and_billing) {
      newErrors.live_meter_and_billing = "Live meter and billing value is required.";
    } else if (isNaN(meterValue) || meterValue <= 0) {
      newErrors.live_meter_and_billing = "Must be a positive number.";
    }

    if (!formData.created_date) {
      newErrors.created_date = "Created date is required.";
    }

    if (!formData.notes || formData.notes.trim().length === 0) {
      newErrors.notes = "Notes cannot be empty.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitState("loading");
    setErrors({});

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chauffeur_service_hourly_booking/${booking.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            live_meter_and_billing: meterValue,
            status: formData.status,
            created_date: formData.created_date,
            notes: formData.notes.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || "Update failed.");
      }

      setSubmitState("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setSubmitState("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-color/30 max-w-lg w-full rounded-2xl shadow-2xl relative overflow-hidden text-white">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-active to-accent-pending" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-border-color/30">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Edit Booking Record
              </h3>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">
                ID: {booking.id.slice(0, 8)}... | Operator: Lead Operator
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-white font-extrabold text-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Live Meter */}
              <div className="flex flex-col">
                <label
                  className="block text-xs font-bold text-muted uppercase tracking-wider mb-2"
                  htmlFor="edit_live_meter"
                >
                  Live Meter &amp; Billing (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-extrabold text-sm">
                    ₹
                  </span>
                  <input
                    id="edit_live_meter"
                    name="live_meter_and_billing"
                    type="number"
                    value={formData.live_meter_and_billing}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white text-sm font-semibold transition-all ${
                      errors.live_meter_and_billing
                        ? "border-rose-500 ring-2 ring-rose-950/40"
                        : "border-border-color/30"
                    }`}
                  />
                </div>
                {errors.live_meter_and_billing && (
                  <p className="text-rose-400 text-[11px] font-bold mt-1.5">
                    {errors.live_meter_and_billing}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label
                  className="block text-xs font-bold text-muted uppercase tracking-wider mb-2"
                  htmlFor="edit_status"
                >
                  Booking Status
                </label>
                <select
                  id="edit_status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border-color/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white text-sm font-semibold cursor-pointer transition-all"
                >
                  <option value="Active" className="bg-surface text-white">Active</option>
                  <option value="Completed" className="bg-surface text-white">Completed</option>
                  <option value="Cancelled" className="bg-surface text-white">Cancelled</option>
                </select>
              </div>

              {/* Created Date */}
              <div className="flex flex-col md:col-span-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Created Date
                </label>
                <input
                  type="date"
                  name="created_date"
                  value={formData.created_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border-color/30 rounded-lg text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-active transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col">
              <label
                className="block text-xs font-bold text-muted uppercase tracking-wider mb-2"
                htmlFor="edit_notes"
              >
                Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="edit_notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white text-sm font-semibold resize-none transition-all ${
                  errors.notes
                    ? "border-rose-500 ring-2 ring-rose-950/40"
                    : "border-border-color/30"
                }`}
              />
              {errors.notes && (
                <p className="text-rose-400 text-[11px] font-bold mt-1.5">{errors.notes}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white font-bold rounded-lg text-xs tracking-wide transition-all border border-border-color/30 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitState === "loading"}
                className="flex-1 py-3 bg-accent-active hover:bg-accent-active/85 text-white font-bold rounded-lg text-xs tracking-wide shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitState === "loading" ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Success / Error Feedback */}
          {submitState === "success" && (
            <div className="mt-4 p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-sm text-emerald-300 font-bold flex items-center gap-2">
              <span>✓</span> Booking updated successfully.
            </div>
          )}
          {submitState === "error" && (
            <div className="mt-4 p-4 bg-rose-950/20 border border-rose-900/40 rounded-lg text-sm text-rose-300 font-bold flex items-center gap-2">
              <span>✕</span> {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
