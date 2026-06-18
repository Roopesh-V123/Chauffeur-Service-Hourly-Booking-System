# Live Production UI Fixes & Core Logic Checklist
## Client: Manivtha Tours & Travels | Author: V.Roopesh (ID: 252U1R1249)

This document details common Next.js/Tailwind CSS fixes for mobile responsiveness and a verification checklist for auditing the live Express billing engine.

---

## 1. Frontend Mobile Viewport Fixes (Tailwind CSS)

To prevent layouts from breaking on physical mobile viewports (down to 375px), implement the following CSS/Tailwind structural code snippets.

### Fix A: Horizontal Table Overflow Scroll
Large tables containing customer lists and UUIDs will cause horizontal clipping on mobile if not wrapped correctly. Wrap all `<table>` elements inside a responsive scroll container:
```tsx
{/* Enforces horizontal scrolling on viewports under 640px */}
<div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 rounded-xl border border-crisp-lightgray shadow-sm bg-white">
  <table className="min-w-full divide-y divide-crisp-lightgray">
    {/* Table headers and rows */}
  </table>
</div>
```

### Fix B: Mobile-First Tap Target Paddings
Buttons and input triggers must adhere to a minimum 44px tap target size constraint on mobile touchscreens to pass usability audits:
```tsx
{/* Mobile-first padding scaling from mobile (px-4 py-3) to desktop (sm:px-5 sm:py-2.5) */}
<button 
  className="w-full sm:w-auto px-4 py-3 sm:px-5 sm:py-2.5 bg-navy-dark text-crisp-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.98]"
>
  Execute Action
</button>
```

### Fix C: Responsive Grids & Stacking Containers
Grid containers must stack vertically on mobile (single column) and expand to multi-column rows as the viewport width scales:
```tsx
{/* Single column by default (mobile), 2 columns on tablets (md), 3 columns on desktops (lg) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
  <div className="p-4 bg-crisp-offwhite border border-crisp-lightgray rounded-xl">Card 1</div>
  <div className="p-4 bg-crisp-offwhite border border-crisp-lightgray rounded-xl">Card 2</div>
  <div className="p-4 bg-crisp-offwhite border border-crisp-lightgray rounded-xl">Card 3</div>
</div>
```

### Fix D: Fluid SVG Viewport Scaling
Custom SVG charts must utilize viewports with dynamic aspect ratios instead of hardcoded width parameters to prevent layout distortions:
```tsx
{/* Dynamic responsiveness using aspect ratios and w-full class */}
<div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
  <svg 
    viewBox="0 0 800 300" 
    className="w-full h-full font-sans"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* SVG Nodes */}
  </svg>
</div>
```

---

## 2. Backend Core Business Logic Verification Checklist

Verify that calculations performed by the Express billing engine (`calculateBookingBill`) accurately enforce the client's rules on production servers.

- [ ] **Base Hourly Rate Rules**:
  - Premium Sedan: ₹1,200/hr
  - Luxury SUV: ₹1,800/hr
  - Executive Van: ₹2,500/hr
- [ ] **Minimum Spacing Rule (4-Hour Threshold)**:
  - Any duration inputs $< 4.0$ hours must be rounded up to exactly $4.0$ hours.
  - *Example test input*: 1.5 hours Sedan booking must calculate base fare as $4 \times 1200 = \text{₹}4,800.00$.
- [ ] **Peak Hours Surcharge (+15%)**:
  - Applicable if the booking starts in slots: 08:00 AM - 11:00 AM or 05:00 PM - 08:00 PM.
  - *Example test input*: 5 hours SUV booking starting at 9:00 AM. Surcharge must equal $0.15 \times (5 \times 1800) = \text{₹}1,350.00$.
- [ ] **Night Shift Surcharge (+20%)**:
  - Applicable if the booking starts in slot: 10:00 PM - 06:00 AM.
  - *Example test input*: 4 hours Sedan booking starting at 11:00 PM. Surcharge must equal $0.20 \times (4 \times 1200) = \text{₹}960.00$.
- [ ] **GST Surcharge (+18%)**:
  - Enforce exactly 18.00% GST on the cumulative subtotal (Base Fare + Dynamic Surcharges).
  - *Mathematical verification*: $\text{Total} = (\text{Base} + \text{Surcharges}) \times 1.18$.
