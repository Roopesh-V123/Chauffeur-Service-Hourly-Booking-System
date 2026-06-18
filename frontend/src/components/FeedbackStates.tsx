"use client";

import React from "react";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 21: Reusable Feedback States Components
// Aesthetic: Navy Blue and Crisp White (70% structural / 30% logic)

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Retrieving records...", size = "md" }: LoadingSpinnerProps) {
  const spinnerSizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-8"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full h-full min-h-[200px] animate-pulse">
      <div 
        className={`${spinnerSizes[size]} border-navy-light border-t-accent-blue rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      <span className="text-[10px] font-black uppercase text-navy-slate tracking-widest text-center px-4 max-w-[280px] sm:max-w-md">
        {message}
      </span>
    </div>
  );
}

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
  
  // Custom responsive SVG Icons matching design system
  const renderIcon = () => {
    switch (iconType) {
      case "search":
        return (
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-navy-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-crisp-white border border-crisp-lightgray rounded-xl p-8 sm:p-12 text-center max-w-md mx-auto my-6 flex flex-col items-center justify-center space-y-4 shadow-sm transition-all hover:shadow">
      <div className="w-16 h-16 rounded-full bg-crisp-offwhite flex items-center justify-center border border-crisp-lightgray/60">
        {renderIcon()}
      </div>
      <div>
        <h4 className="text-sm sm:text-base font-black text-navy-dark uppercase tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-navy-slate font-semibold mt-1 max-w-[280px] sm:max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Dynamic CTA trigger button adhering to standard size spacing constraints */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 w-full sm:w-auto px-5 py-2.5 bg-navy-dark hover:bg-accent-blue text-crisp-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
