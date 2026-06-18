# Review 2 - Presentation Script & Slide Text
## Chauffeur Service Hourly Booking System
### Client: Manivtha Tours & Travels | Author: V.Roopesh (ID: 252U1R1249)

---

## SLIDE 1: TITLE SLIDE (All Roles)

**Title:** Chauffeur Service Hourly Booking System — Review 2 Milestone
**Subtitle:** Manivtha Tours & Travels | Production-Grade Fleet Management Platform
**Presented by:** V.Roopesh (ID: 252U1R1249)
**Date:** June 2026

**Speaker Notes:**
Good morning. Today we present the Review 2 milestone for our Chauffeur Service Hourly Booking System, developed for Manivtha Tours & Travels. This review covers our frontend architecture decisions, backend logic engine, database design, and testing coverage achieved to date.

---

# STUDENT 1 — FRONTEND

---

## SLIDE 2: UI/UX Design Philosophy — The "Antigravity" Aesthetic

**Title:** Design System: Navy Blue & Crisp White Antigravity Aesthetic

**Bullet Points:**
- Color palette strictly enforced via Tailwind CSS theme tokens: Navy Dark (`#0B132B`), Navy Medium (`#1C2541`), Crisp White (`#FFFFFF`), Off-White (`#F8FAFC`)
- Accent colors reserved for interactive elements: Cyan (`#48CAE4`) for focus states, Blue (`#0077B6`) for primary actions, Gold (`#D4AF37`) for premium tier indicators
- Glassmorphism-inspired card components (`backdrop-blur-md`, semi-transparent white backgrounds) convey a premium, trustworthy travel-service feel
- Typography uses the Geist Sans family with aggressive font-weight hierarchy (black for headings, semibold for body, medium for captions)
- All interactive elements include micro-animations: `transition-all duration-200`, `active:scale-[0.99]`, and `hover:shadow-2xl` for tactile feedback

**Speaker Notes:**
Our design language is intentionally restrained. We use only two primary tones — deep navy blue and crisp white — to project trust, professionalism, and clarity. Every color in our palette is tokenized in the Tailwind configuration, meaning no ad-hoc hex codes exist anywhere in the codebase. This enforces visual consistency across all four screens.

---

## SLIDE 3: Structural Ratio — 70% Tailwind CSS / 30% React Logic

**Title:** Code Architecture: 70/30 Structural-to-Logic Ratio

**Bullet Points:**
- 70% of each component is Tailwind utility classes handling layout, spacing, typography, borders, shadows, and responsive breakpoints
- 30% is React state logic: `useState` for form data and errors, `useEffect` for API data fetching with debounced search queries
- This ratio keeps React components clean, readable, and highly maintainable — logic is isolated from presentation
- Responsive grid system: `grid-cols-1 md:grid-cols-2 lg:grid-cols-2` ensures seamless adaptation from 375px mobile to 1920px desktop
- Zero external UI component libraries used — every element is hand-crafted with utility classes for full design control

**Speaker Notes:**
We made a deliberate architectural choice to rely heavily on Tailwind utility classes rather than external component libraries. This gives us pixel-level control over the aesthetic while keeping our React logic minimal. Each component file reads like a layout blueprint first and a logic file second.

---

## SLIDE 4: User Flow — Step-by-Step Booking Journey

**Title:** End-to-End User Flow: From Entry to Invoice

**Bullet Points:**
- **Step 1 — Booking Entry Form:** Operator fills in Live Meter & Billing (₹), selects Status (Active/Completed/Cancelled), picks Created Date, and adds Notes
- **Step 2 — Client-Side Validation:** Required fields are validated instantly; red error labels appear below invalid inputs without page reload
- **Step 3 — Submission Confirmation:** On successful validation, a green confirmation card appears showing the submitted parameters as a local preview
- **Step 4 — Live Dashboard:** The new booking appears in the operational data table with colored status badges, sorted by creation date (DESC)
- **Step 5 — Detail View:** Clicking "View Detail" opens a modal overlay showing the full booking specification including customer name, vehicle assignment, and license plate
- **Step 6 — Fare Computation:** The billing engine processes duration, peak/night surcharges, and 18% GST, displaying the total estimated fare in a dedicated results card

**Speaker Notes:**
This flow represents the complete happy path. The operator never leaves the single-page dashboard. Every interaction — from form entry to invoice preview — happens within the same viewport, minimizing context switching and maximizing operational efficiency.

---

## SLIDE 5: Four Core Frontend Screens

**Title:** Screen Inventory: 4 Production Modules

**Bullet Points:**
- **Screen 1 — Hourly Booking Entry Form:** Glassmorphic card with ₹ currency prefix, date picker, status dropdown, and notes textarea
- **Screen 2 — Live Dashboard:** Filterable data table with status badges, search-by-meter input, and "View Detail" action buttons
- **Screen 3 — Payment & Billing Tracker:** Fare breakdown grid showing base fare, surcharges, GST, and grand total with print/process actions
- **Screen 4 — Reports & Analytics:** KPI tiles (Total Bookings, Revenue, Utilization Rate, Avg Duration) with mock bar chart visualization

**Speaker Notes:**
Each screen maps directly to a business function at Manivtha Tours & Travels. The entry form replaces their paper journals, the dashboard replaces phone-based status checks, the billing tracker replaces manual Excel invoicing, and the reports screen replaces end-of-month ledger consolidation.

---

# STUDENT 2 — BACKEND

---

## SLIDE 6: System Architecture Overview

**Title:** System Architecture: Next.js + Express + PostgreSQL

**Bullet Points:**
- **Frontend Layer:** Next.js 16 (App Router) with TypeScript, Tailwind CSS v4, deployed on port 3000/3001
- **Backend Layer:** Express.js with TypeScript, Zod schema validation, running on port 5000
- **Database Layer:** PostgreSQL with Prisma ORM v5.22 for type-safe queries and auto-generated migrations
- **Service Layer:** Dedicated `billingEngine.ts` service decoupled from route handlers for testability and reuse
- **Communication:** REST API over HTTP with JSON payloads; frontend calls backend directly via `fetch()` on `localhost:5000`

**Speaker Notes:**
Our three-tier architecture cleanly separates concerns. The frontend handles presentation only. The backend handles validation, business logic, and database operations. The billing engine is extracted into its own service module so it can be unit-tested independently without spinning up an Express server.

---

## SLIDE 7: Entity-Relationship Diagram

**Title:** Database Schema: 4 Core Entities with Foreign Key Relationships

**Bullet Points:**
- **Customer** (1) → (Many) **ChauffeurServiceHourlyBooking**: A customer places multiple bookings
- **Vehicle** (1) → (Many) **ChauffeurServiceHourlyBooking**: A vehicle is assigned to multiple bookings
- **ChauffeurServiceHourlyBooking** (1) → (Many) **Payment**: Each booking generates one or more payment records
- All primary keys are UUID v4 for distributed-safe identification
- Cascade delete on Customer → Bookings; Restrict delete on Vehicle → Bookings (prevents fleet data loss)

**Speaker Notes:**
The ER diagram shows four tables with clear relational integrity. We chose cascade delete on customers because when a client account is removed, their booking history should be purged. However, we restrict vehicle deletion to prevent accidental loss of fleet records that may have active bookings attached.

---

## SLIDE 8: API Route Summary

**Title:** RESTful API Contract: 5 Endpoints

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Server health check |
| `POST` | `/api/chauffeur_service_hourly_booking` | Create new booking (Zod validated) |
| `GET` | `/api/chauffeur_service_hourly_booking` | List all bookings (paginated, filterable) |
| `GET` | `/api/chauffeur_service_hourly_booking/:id` | Fetch single booking detail |
| `GET` | `/api/chauffeur_service_hourly_booking/:id/calculate` | Compute fare breakdown |

**Speaker Notes:**
Every endpoint follows REST conventions. The POST route uses Zod for strict schema validation — rejecting negative meter values, invalid status strings, and missing dates before any database write occurs. The calculate endpoint is read-only and returns a computed fare object without modifying any records.

---

## SLIDE 9: Core Business Logic — Worked Example

**Title:** Worked Example: 4-Hour Luxury SUV Booking at 9:00 AM

**Bullet Points:**
- **Input Parameters:** Duration = 4 hours, Vehicle = Luxury SUV (₹1,800/hr), Start Time = 09:00 AM
- **Step 1 — Minimum Hour Check:** 4 hours ≥ 4-hour minimum threshold → Billed Hours = 4 (no rounding)
- **Step 2 — Base Fare:** 4 hours × ₹1,800/hr = **₹7,200.00**
- **Step 3 — Peak Surcharge:** 09:00 AM falls within peak window (08:00–11:00 AM) → +15% of ₹7,200 = **+₹1,080.00**
- **Step 4 — Night Surcharge:** 09:00 AM is NOT within night window (10:00 PM–06:00 AM) → **₹0.00**
- **Step 5 — Subtotal:** ₹7,200 + ₹1,080 + ₹0 = **₹8,280.00**
- **Step 6 — GST (18%):** ₹8,280 × 0.18 = **₹1,490.40**
- **Step 7 — Total Amount:** ₹8,280 + ₹1,490.40 = **₹9,770.40**

**Speaker Notes:**
This worked example demonstrates every step of our billing engine in plain language. The engine first enforces the 4-hour minimum, then calculates the base fare, checks time-of-day surcharges independently (they are additive, never compounded), and finally applies 18% GST. The total for this specific scenario is nine thousand seven hundred and seventy rupees and forty paise.

---

# STUDENT 3 — TESTING & DEPLOYMENT

---

## SLIDE 10: Literature Survey — Identified Gaps

**Title:** Literature Survey: Research Gaps in Existing Fleet Systems

**Bullet Points:**
- **Gap 1:** Most existing fleet management platforms lack real-time dynamic pricing — they use static rate cards that cannot adapt to peak/night conditions
- **Gap 2:** Academic papers on booking systems rarely address the minimum-hour billing threshold, a critical business rule in the chauffeur industry
- **Gap 3:** Existing open-source solutions (e.g., WordPress booking plugins) do not provide role-based dashboards separating dispatcher and billing specialist views
- **Gap 4:** Few studies address cross-midnight surcharge calculations where a single trip spans two different pricing windows
- **Gap 5:** Limited research exists on glassmorphism-based UI design specifically applied to B2B travel management interfaces

**Speaker Notes:**
Our literature survey identified five key gaps that our system directly addresses. The most significant is the lack of dynamic surcharge engines in existing platforms — most competitors use flat-rate pricing regardless of time of day. Our billing engine solves this with mathematically verified peak-hour and night-time multipliers.

---

## SLIDE 11: Existing System Analysis

**Title:** Current Process at Manivtha Tours: Manual vs. Digital

**Bullet Points:**
- **Manual Booking:** Paper journals and unstructured Excel rows → replaced by structured web form with validation
- **Manual Calculation:** Operators manually apply surcharges from memory → replaced by automated billing engine
- **Manual Invoicing:** Word document templates manually populated → replaced by system-generated fare breakdowns
- **Manual Fleet Tracking:** Phone calls to check chauffeur status → replaced by real-time dashboard with status badges
- **Manual Reporting:** End-of-month ledger consolidation → replaced by live analytics with KPI tiles

**Speaker Notes:**
Every manual process at Manivtha Tours has a direct digital counterpart in our system. The most impactful replacement is the billing engine — it eliminates the surcharge calculation errors that previously led to billing disputes with corporate clients.

---

## SLIDE 12: Test Coverage & Progress

**Title:** Quality Assurance: 24 Master Test Cases Executed

**Bullet Points:**
- **Frontend UI Tests (FT-001 to FT-006):** Validates form inputs, dropdown options, responsive layouts
- **API Route Tests (API-001 to API-006):** Validates POST creation, GET listing, PUT updates, and error responses
- **Database Tests (DB-001 to DB-006):** Validates foreign key constraints, unique constraints, cascade deletes
- **Core Logic Tests (LOG-001 to LOG-006):** Validates pricing accuracy, surcharge calculations, GST application
- **All 24 test cases documented in `Test_Plan_v2.md`** with Test ID, Module, Description, and Expected Result columns
- Additional 10 granular pricing regression tests (TS-21 to TS-30) tracked in `test_tracker.md`

**Speaker Notes:**
Our testing strategy covers four layers: UI, API, Database, and Core Logic. The 10 regression tests specifically target mathematical accuracy — including edge cases like zero-hour bookings, negative inputs, and cross-midnight surcharge windows. Every test case is traceable to a specific business requirement.

---

## SLIDE 13: GitHub Version Control Strategy

**Title:** Git Workflow: Feature Branch Strategy

**Bullet Points:**
- **Branch `feature/frontend`:** All Next.js components, Tailwind configurations, and page layouts
- **Branch `feature/backend`:** Express routes, Prisma schemas, billing engine service, and database migrations
- **Merge Strategy:** Feature branches merged into `main` after code review and compile-check verification
- **Commit Convention:** Conventional commits format (`feat:`, `fix:`, `docs:`) for traceability
- **Conflict Resolution:** Documented step-by-step procedure in `README.md` for resolving merge conflicts

**Speaker Notes:**
We use a feature-branch workflow where frontend and backend code are developed on separate branches and merged into main only after passing TypeScript compilation checks. This prevents broken code from reaching the main branch and ensures both halves of the system are independently stable.

---

## SLIDE 14: CLOSING SLIDE (All Roles)

**Title:** Thank You — Questions & Feedback

**Bullet Points:**
- System fully functional on localhost (Backend: Port 5000, Frontend: Port 3001)
- 24 master test cases + 10 regression tests executed and documented
- Core billing engine mathematically verified with edge-case coverage
- Codebase ready for Review 2 evaluation

**Speaker Notes:**
Thank you for your time. We are happy to demonstrate any module live or walk through any specific code file. The system is currently running on localhost and can be demonstrated immediately.
