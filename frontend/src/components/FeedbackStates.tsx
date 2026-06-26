"use client";

import React from "react";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 21: Reusable Feedback States Components
// Aesthetic: Navy Blue and Crisp White (70% structural / 30% logic)

// ── Shared shimmer animation class ───────────────────────────────────────────
// All skeleton blocks use the same pulsing shimmer effect.

/** A single shimmer block for skeleton rows */
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gradient-to-r from-surface via-navy-light to-surface rounded animate-pulse ${className ?? ""}`}
      style={{
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s ease-in-out infinite"
      }}
    />
  );
}

// ── Inline CSS for shimmer keyframes (injected once via a hidden style tag) ──
export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skeleton-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TABLE ROW SKELETON  — used by ChauffeurServiceHourlyBookingDashboard
// ─────────────────────────────────────────────────────────────────────────────

export function TableRowSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div className="overflow-x-auto rounded-xl border border-border-color/30 shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-border-color/30 text-muted text-[11px] font-bold uppercase tracking-wider">
              <th className="py-4 px-5">Billing Meter (₹)</th>
              <th className="py-4 px-5">Pickup Date</th>
              <th className="py-4 px-5">Chauffeur Notes</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/20 bg-background">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="py-4 px-5">
                  <SkeletonBlock className="h-4 w-24" />
                </td>
                <td className="py-4 px-5">
                  <SkeletonBlock className="h-3 w-20" />
                </td>
                <td className="py-4 px-5">
                  <SkeletonBlock className="h-3 w-48" />
                </td>
                <td className="py-4 px-5">
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                </td>
                <td className="py-4 px-5">
                  <div className="flex justify-end gap-2">
                    <SkeletonBlock className="h-7 w-14 rounded-lg" />
                    <SkeletonBlock className="h-7 w-10 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. KPI CARDS SKELETON  — used by DashboardSummaryWidget
// ─────────────────────────────────────────────────────────────────────────────

export function KpiCardsSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface/85 backdrop-blur-md border border-border-color/30 rounded-xl p-6 shadow-md flex items-center justify-between"
          >
            <div className="flex flex-col gap-3 w-full">
              <SkeletonBlock className="h-2.5 w-28" />
              <SkeletonBlock className="h-8 w-16" />
              <SkeletonBlock className="h-2 w-36" />
            </div>
            <SkeletonBlock className="w-12 h-12 rounded-full flex-shrink-0 ml-4" />
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BOOKING DETAIL SKELETON  — used by ChauffeurServiceHourlyBookingDetail
// ─────────────────────────────────────────────────────────────────────────────

export function BookingDetailSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div className="bg-surface border border-border-color/30 rounded-2xl p-8 max-w-full lg:max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border-color/30 pb-6 mb-8 gap-4">
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="h-6 w-72" />
            <SkeletonBlock className="h-2.5 w-48" />
          </div>
          <SkeletonBlock className="h-9 w-36 rounded-lg" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Core section */}
            <div className="bg-background border border-border-color/20 rounded-xl p-6">
              <SkeletonBlock className="h-3 w-48 mb-4" />
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <SkeletonBlock className="h-2.5 w-20" />
                    <SkeletonBlock className="h-4 w-28" />
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border-color/20">
                <SkeletonBlock className="h-2.5 w-24 mb-2" />
                <SkeletonBlock className="h-12 w-full rounded-lg" />
              </div>
            </div>

            {/* Customer section */}
            <div className="bg-background border border-border-color/20 rounded-xl p-6">
              <SkeletonBlock className="h-3 w-40 mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <SkeletonBlock className="h-2.5 w-12" />
                    <SkeletonBlock className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            <div className="bg-background border border-border-color/20 rounded-xl p-6">
              <SkeletonBlock className="h-3 w-32 mb-4" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border-color/20 rounded-lg p-3 mb-3">
                  <div className="flex justify-between mb-2">
                    <SkeletonBlock className="h-2.5 w-16" />
                    <SkeletonBlock className="h-4 w-12 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <SkeletonBlock className="h-2.5 w-24" />
                    <SkeletonBlock className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PAYMENT TRACKER SKELETON  — used by PaymentBillingTracker
// ─────────────────────────────────────────────────────────────────────────────

export function PaymentTrackerSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div className="flex flex-col py-16 space-y-6 px-4">
        {/* Dropdown placeholder */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-2.5 w-32" />
          <SkeletonBlock className="h-11 w-full rounded-lg" />
        </div>

        {/* Billing breakdown placeholder */}
        <div className="bg-surface rounded-lg p-5 border border-border-color/30 space-y-4">
          <SkeletonBlock className="h-2.5 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <SkeletonBlock className="h-3 w-36" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Method buttons placeholder */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. REPORTS SKELETON  — used by ReportsAnalyticsDashboard
// ─────────────────────────────────────────────────────────────────────────────

export function ReportsSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div className="space-y-6">
        {/* KPI stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border-color/30 rounded-lg p-5 flex flex-col gap-3">
              <SkeletonBlock className="h-2.5 w-24" />
              <SkeletonBlock className="h-7 w-20" />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bar chart skeleton */}
          <div className="border border-border-color/30 rounded-lg p-6 bg-surface">
            <SkeletonBlock className="h-3 w-40 mb-6" />
            <div className="flex items-end gap-6 h-40 px-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <SkeletonBlock className={`w-full rounded-t-sm ${i === 1 ? "h-32" : i === 0 ? "h-24" : "h-16"}`} />
                  <SkeletonBlock className="h-2 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Line chart skeleton */}
          <div className="lg:col-span-2 border border-border-color/30 rounded-lg p-6 bg-surface">
            <SkeletonBlock className="h-3 w-56 mb-6" />
            <div className="relative h-40">
              <SkeletonBlock className="h-full w-full rounded" />
              {/* Simulated dots overlay */}
              <div className="absolute inset-0 flex items-center justify-around px-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonBlock key={i} className="w-3 h-3 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FULL PAGE SKELETON  — used by app/bookings/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

export function BookingPageSkeleton() {
  return (
    <>
      <SkeletonStyles />
      <div className="min-h-screen bg-background">
        {/* Header bar */}
        <div className="sticky top-0 z-50 border-b border-border-color/30 bg-surface/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-3 w-3 rounded-full" />
            <SkeletonBlock className="h-3 w-28" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Title block */}
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-8 w-56" />
            <SkeletonBlock className="h-3 w-80" />
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 border border-border-color/30 bg-surface shadow-md flex flex-col gap-3">
                <SkeletonBlock className="h-2.5 w-16" />
                <SkeletonBlock className="h-7 w-24" />
                <SkeletonBlock className="h-2 w-20" />
              </div>
            ))}
          </div>

          {/* 2-col detail grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 border border-border-color/30 bg-surface shadow-md">
                <SkeletonBlock className="h-3 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex flex-col gap-2">
                      <SkeletonBlock className="h-2 w-16" />
                      <SkeletonBlock className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. EMPTY STATE (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateMessageProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  iconType?: "search" | "database" | "error";
}

export function EmptyStateMessage({
  title = "No Records Found",
  description = "There are no operational data logs fitting the requested filters.",
  actionText,
  onAction,
  iconType = "database"
}: EmptyStateMessageProps) {
  const renderIcon = () => {
    switch (iconType) {
      case "search":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "database":
      default:
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-accent-active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-surface border border-border-color/30 rounded-xl p-8 sm:p-12 text-center max-w-md mx-auto my-6 flex flex-col items-center justify-center space-y-4 shadow-sm transition-all hover:shadow text-foreground">
      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border border-border-color/20">
        {renderIcon()}
      </div>
      <div>
        <h4 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-muted font-semibold mt-1 max-w-[280px] sm:max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 w-full sm:w-auto px-5 py-2.5 bg-accent-active hover:bg-accent-active/85 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
