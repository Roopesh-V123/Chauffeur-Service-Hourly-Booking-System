"use client";

import React from "react";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 19: Breadcrumb Navigation Component
// Aesthetic: Navy Blue and Crisp White professional style

interface BreadcrumbProps {
  activeSection: string;
}

export default function Breadcrumb({ activeSection }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-xs font-semibold text-navy-slate mb-6">
      <span className="hover:text-accent-blue transition-colors cursor-pointer">Home</span>
      <span className="text-crisp-lightgray font-light">/</span>
      <span className="text-navy-dark font-black tracking-tight">{activeSection}</span>
    </nav>
  );
}
