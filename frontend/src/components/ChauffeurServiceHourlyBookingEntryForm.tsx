"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/app/api";

/**
 * Author: QA Reviewer (ID: MNVT-OP-9944)
 * Module: Chauffeur Service Hourly Booking Entry Form
 * Aesthetic System: Navy Blue (#0B132B, #1C2541) and Crisp White (#FFFFFF)
 */
/**
 * @component ChauffeurServiceHourlyBookingEntryForm
 * @description Form component for creating new chauffeur service hourly bookings with real-time client-side validations.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */
interface EntryFormProps {
  /** Optional callback invoked after a booking is saved successfully. Used by the parent to switch to Dashboard. */
  onBookingSaved?: () => void;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  category: string;
}

export default function ChauffeurServiceHourlyBookingEntryForm({ onBookingSaved }: EntryFormProps = {}) {
  /**
   * @type {object} formData
   * @property {string} live_meter_and_billing - The live fare/billing value input by user
   * @property {string} status - Booking status enum (Active, Completed, Cancelled)
   * @property {string} created_date - The date the booking was registered
   * @property {string} notes - Operator/Chauffeur specific notes
   * @description Handles state of form fields.
   */
  const [formData, setFormData] = useState({
    live_meter_and_billing: "",
    status: "Active",
    created_date: "",
    notes: "",
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  /**
   * @type {object} errors
   * @description Tracks validation errors for each input field.
   */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * @type {object|null} submittedData
   * @description Stores validated data after submission for success preview.
   */
  const [submittedData, setSubmittedData] = useState<{
    live_meter_and_billing: string;
    status: string;
    created_date: string;
    notes: string;
    vehicle_id?: string;
    id?: string;
  } | null>(null);

  /**
   * Submission and API feedback states
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState(false);

  // Load vehicles list on mount
  useEffect(() => {
    async function loadVehicles() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/vehicles`);
        if (!response.ok) throw new Error("API Offline");
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setVehicles(json.data);
          if (json.data.length > 0) {
            setSelectedVehicleId(json.data[0].id);
          }
        }
      } catch (err) {
        console.warn("[EntryForm] Failed to fetch vehicles, using local seed references.");
        const mockVehiclesList: Vehicle[] = [
          { id: "2d17c918-a6d1-443b-bd98-7cfa8c9590b1", make: "Toyota", model: "Innova Crysta", plateNumber: "AP-09-XX-1234", category: "Luxury SUV" },
          { id: "9c17c918-a6d1-443b-bd98-7cfa8c9590b2", make: "BMW", model: "5 Series", plateNumber: "TS-09-YY-9999", category: "Premium Sedan" },
          { id: "ec17c918-a6d1-443b-bd98-7cfa8c9590b3", make: "Mercedes", model: "V-Class", plateNumber: "KA-03-ZZ-8888", category: "Executive Van" }
        ];
        setVehicles(mockVehiclesList);
        setSelectedVehicleId(mockVehiclesList[0].id);
      }
    }
    loadVehicles();
  }, []);

  /**
   * @function handleChange
   * @description Updates state of formData fields dynamically and resets specific field error states.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - Input change event
   * 
   * @author QA Reviewer (ID: MNVT-OP-9944)
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * @function handleFormSubmit
   * @description Validates fields on submit and registers a new hourly booking via the backend API.
   * @param {React.FormEvent} e - Form submission event
   * 
   * @author QA Reviewer (ID: MNVT-OP-9944)
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const meterValue = Number(formData.live_meter_and_billing);
    if (!formData.live_meter_and_billing) {
      newErrors.live_meter_and_billing = "Live meter and billing value is required.";
    } else if (isNaN(meterValue) || meterValue <= 0) {
      newErrors.live_meter_and_billing = "Live meter and billing must be a positive number.";
    }

    if (!formData.created_date) {
      newErrors.created_date = "Created date is required.";
    }

    if (!formData.notes || formData.notes.trim().length === 0) {
      newErrors.notes = "Additional notes are required.";
    }

    if (!selectedVehicleId) {
      newErrors.vehicle_id = "Please select a vehicle type.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmittedData(null);
      setApiSuccess(false);
      return;
    }

    setErrors({});
    setApiError("");
    setApiSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chauffeur_service_hourly_booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          live_meter_and_billing: meterValue,
          status: formData.status,
          created_date: formData.created_date,
          notes: formData.notes,
          vehicle_id: selectedVehicleId,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || json.error || "Failed to save booking to database.");
      }

      setSubmittedData({
        ...formData,
        vehicle_id: selectedVehicleId,
        id: json.data?.id,
      });
      setApiSuccess(true);
      
      // Reset form input values
      setFormData({
        live_meter_and_billing: "",
        status: "Active",
        created_date: "",
        notes: "",
      });
      if (vehicles.length > 0) {
        setSelectedVehicleId(vehicles[0].id);
      }

      // After 2.5s — navigate to Dashboard so user can see the new booking
      if (onBookingSaved) {
        setTimeout(onBookingSaved, 2500);
      }
    } catch (err: any) {
      console.error("[Form Submit Error]:", err);
      setApiError(
        err.message || 
        "Unable to connect to the backend server. Please make sure the service is running on port 5000."
      );
      setSubmittedData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-surface border border-border-color/30 rounded-2xl shadow-xl p-6 sm:p-8 max-w-full lg:max-w-6xl mx-auto transition-all duration-300 hover:shadow-2xl text-white">
      {/* Visual Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-active to-accent-pending" />

      {/* Header Info */}
      <div className="mb-6 pb-4 border-b border-border-color/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Hourly Booking Entry Form
          </h2>
          <p className="text-[11px] sm:text-xs text-muted font-bold uppercase tracking-wider mt-1">
            System Lead: Lead Operator | ID: MNVT-OP-9944
          </p>
        </div>
        <span className="text-[10px] bg-[#1a1a1a] text-white border border-border-color/20 px-2.5 py-1 rounded font-bold uppercase">
          Client UI v2
        </span>
      </div>

      <form className="space-y-6" onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Meter and Billing */}
          <div className="flex flex-col">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2" htmlFor="live_meter_and_billing">
              Live Meter and Billing (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-extrabold text-sm">₹</span>
              <input
                id="live_meter_and_billing"
                name="live_meter_and_billing"
                type="number"
                placeholder="e.g. 7500"
                disabled={isSubmitting}
                value={formData.live_meter_and_billing}
                onChange={handleChange}
                className={`w-full pl-8 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white placeholder-muted transition-all text-sm font-semibold ${
                  isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                } ${
                  errors.live_meter_and_billing ? "border-rose-500 ring-2 ring-rose-950/40" : "border-border-color/30"
                }`}
              />
            </div>
            {errors.live_meter_and_billing && (
              <p className="text-rose-400 text-[11px] font-bold mt-1.5">{errors.live_meter_and_billing}</p>
            )}
          </div>

          {/* Booking Status Dropdown */}
          <div className="flex flex-col">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2" htmlFor="status">
              Booking Status
            </label>
            <select
              id="status"
              name="status"
              disabled={isSubmitting}
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-background border border-border-color/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white transition-all text-sm font-semibold cursor-pointer ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <option value="Active" className="bg-surface text-white">Active</option>
              <option value="Completed" className="bg-surface text-white">Completed</option>
              <option value="Cancelled" className="bg-surface text-white">Cancelled</option>
            </select>
          </div>

          {/* Car / Vehicle Type Dropdown */}
          <div className="flex flex-col">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2" htmlFor="vehicle_id">
              Car / Vehicle Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="vehicle_id"
              name="vehicle_id"
              disabled={isSubmitting}
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                if (errors.vehicle_id) {
                  setErrors((prev) => ({ ...prev, vehicle_id: "" }));
                }
              }}
              className={`w-full px-4 py-3 bg-background border border-border-color/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white transition-all text-sm font-semibold cursor-pointer ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-surface text-white">
                  {v.category} ({v.make} {v.model} - {v.plateNumber})
                </option>
              ))}
            </select>
            {errors.vehicle_id && (
              <p className="text-rose-400 text-[11px] font-bold mt-1.5">{errors.vehicle_id}</p>
            )}
          </div>

          {/* Created Date Picker */}
          <div className="flex flex-col">
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2" htmlFor="created_date">
              Created Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="created_date"
              name="created_date"
              type="date"
              disabled={isSubmitting}
              value={formData.created_date}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white transition-all text-sm font-semibold ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              } ${
                errors.created_date ? "border-rose-500 ring-2 ring-rose-950/40" : "border-border-color/30"
              }`}
            />
            {errors.created_date && (
              <p className="text-rose-400 text-[11px] font-bold mt-1.5">{errors.created_date}</p>
            )}
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="flex flex-col">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2" htmlFor="notes">
            Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            disabled={isSubmitting}
            placeholder="Provide specific notes and trip execution metrics..."
            value={formData.notes}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-active focus:border-transparent text-white placeholder-muted transition-all text-sm font-semibold resize-none ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            } ${
              errors.notes ? "border-rose-500 ring-2 ring-rose-950/40" : "border-border-color/30"
            }`}
          />
          {errors.notes && (
            <p className="text-rose-400 text-[11px] font-bold mt-1.5">{errors.notes}</p>
          )}
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="p-4 bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-lg text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
            <span className="text-sm">⚠️</span>
            <div className="flex-1">
              <p className="font-extrabold text-rose-200">Database Save Failed</p>
              <p className="mt-0.5 text-rose-400">{apiError}</p>
            </div>
          </div>
        )}

        {/* Submit Booking */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 font-bold rounded-lg shadow-md transition-all duration-200 transform active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent-active border border-transparent text-sm tracking-wide flex items-center justify-center gap-2 ${
            isSubmitting
              ? "bg-accent-active/60 text-white/80 cursor-not-allowed"
              : "bg-accent-active hover:bg-accent-active/85 text-white cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving Booking...
            </>
          ) : (
            "Confirm & Save Booking"
          )}
        </button>
      </form>

      {/* Database Submission Success Detail View */}
      {submittedData && apiSuccess && (
        <div className="mt-6 p-5 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-sm text-emerald-300 transition-all duration-300 animate-fadeIn">
          <p className="font-extrabold flex items-center mb-2 text-emerald-200">
            <span className="mr-2">✓</span> Booking Saved to Database Successfully (Operator: Lead Operator, ID: MNVT-OP-9944)
          </p>
          <ul className="space-y-1 font-semibold text-xs text-emerald-400">
            {submittedData.id && (
              <li><strong>Record UUID:</strong> <span className="font-mono bg-[#1e1e1e] px-1.5 py-0.5 rounded text-[10px] text-white border border-border-color/30">{submittedData.id}</span></li>
            )}
            <li><strong>Live Meter Cost:</strong> ₹{Number(submittedData.live_meter_and_billing).toLocaleString("en-IN")}</li>
            <li><strong>Trip Status:</strong> {submittedData.status}</li>
            <li><strong>Selected Car Type:</strong> {vehicles.find(v => v.id === submittedData.vehicle_id)?.category || "Default"}</li>
            <li><strong>Booking Date:</strong> {new Date(submittedData.created_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</li>
            <li><strong>Additional Notes:</strong> {submittedData.notes}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
