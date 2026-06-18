# Remaining Work Plan
## Chauffeur Service Hourly Booking System
### Client: Manivtha Tours & Travels | Author: V.Roopesh (ID: 252U1R1249)

This document outlines the remaining development tasks required to bring the system to full production readiness.

---

## 1. Frontend — Remaining Screens & Enhancements

### 1.1 Edit Booking Form

**File:** `src/components/ChauffeurServiceHourlyBookingEditForm.tsx` (NEW)

**Plan:**
- Create a modal-overlay edit form that pre-populates all fields from an existing booking record
- Reuse the same glassmorphism card layout and Navy Blue / Crisp White palette from the Entry Form for visual consistency
- Fields to include: `live_meter_billing` (editable number input), `status` (dropdown: Active → Completed → Cancelled), `created_date` (read-only, display only), `notes` (editable textarea), `duration_hours` (editable number input)
- The "Save Changes" button sends a `PUT` request to `/api/chauffeur_service_hourly_booking/:id` with Zod-validated payload
- Add a "Cancel" button that closes the modal without submitting
- Include a confirmation micro-animation (scale-in + fade) on successful update
- **Aesthetic Constraint:** All inputs must use `border-navy-light focus:ring-accent-cyan` styling; the modal backdrop must use `bg-navy-dark/60 backdrop-blur-sm`

### 1.2 Payments Management Interface

**File:** `src/components/PaymentManagement.tsx` (NEW)

**Plan:**
- Build a full CRUD interface for viewing, creating, and updating payment records linked to bookings
- Layout: Two-column grid on desktop (`grid-cols-1 lg:grid-cols-2`) — left column shows the payment list table, right column shows the payment creation form
- Payment list table columns: `Transaction Ref`, `Booking ID` (truncated UUID), `Amount (₹)`, `Method` (Cash/Card/UPI/Bank Transfer), `Status` (Pending/Completed/Failed), `Date`
- Status badges: Completed → `bg-green-100 text-green-800`, Pending → `bg-amber-100 text-amber-800`, Failed → `bg-red-100 text-red-800`
- Payment creation form fields: `Booking ID` (searchable dropdown), `Amount` (₹ prefix), `Method` (dropdown), `Transaction Ref` (text input)
- Connects to `GET /api/payments` for listing and `POST /api/payments` for creation
- **Aesthetic Constraint:** Card containers must use `rounded-2xl shadow-lg bg-crisp-white/90 backdrop-blur-md`; all currency values rendered with `font-mono font-bold text-navy-dark`

### 1.3 Reports Dashboard — Live Data Integration

**File:** `src/components/ReportsAnalyticsDashboard.tsx` (MODIFY)

**Plan:**
- Replace all hardcoded mock KPI values with live data fetched from `GET /api/analytics/summary`
- KPI tiles to display: **Total Bookings** (count), **Total Revenue** (₹ sum), **Average Duration** (hours), **Fleet Utilization Rate** (%)
- Add a date range filter (From / To date pickers) that passes query params to the analytics endpoint
- Replace the mock bar chart with a proportional CSS bar chart using Tailwind width utilities (`w-[XX%]`) calculated from actual revenue data per status category
- Add a "Download Report" button (placeholder — logs to console for now) styled with `bg-accent-gold text-navy-dark font-bold`
- **Aesthetic Constraint:** KPI tiles must use `bg-gradient-to-br from-navy-dark to-navy-medium text-crisp-white` for the dark-card variant

### 1.4 Dashboard Enhancements

**File:** `src/components/ChauffeurServiceHourlyBookingDashboard.tsx` (MODIFY)

**Plan:**
- Add an "Edit" action button next to each "View Detail" button in the data table
- Wire the "Edit" button to open the `ChauffeurServiceHourlyBookingEditForm` modal pre-loaded with the selected booking's data
- Add a "Quick Status Toggle" button per row that sends a `PATCH` request to update status (Active → Completed)
- Add loading skeleton states using animated Tailwind `animate-pulse` placeholder rows while data is being fetched
- Implement proper empty-state UI: centered message with icon when no bookings match the current filter

---

## 2. Backend — Remaining API Routes

### 2.1 PUT /api/chauffeur_service_hourly_booking/:id — Full Update

**File:** `src/routes/booking.ts` (MODIFY)

**Plan:**
- Add a new `PUT` route handler that accepts the booking ID as a URL parameter
- Validate the request body with a Zod schema identical to the create schema (all fields required)
- Use `prisma.chauffeurServiceHourlyBooking.update()` with the validated data
- Return the updated record as JSON with status `200`
- Handle `404` if the booking ID does not exist in the database
- Handle Zod validation errors with status `400` and structured error messages

### 2.2 PATCH /api/chauffeur_service_hourly_booking/:id/status — Status Toggle

**File:** `src/routes/booking.ts` (MODIFY)

**Plan:**
- Add a new `PATCH` route handler that accepts only a `{ status: string }` body
- Validate that the status value is one of: `"Active"`, `"Completed"`, `"Cancelled"` using `z.enum()`
- Use `prisma.chauffeurServiceHourlyBooking.update()` to modify only the `status` field
- Return the updated record as JSON with status `200`
- Handle `404` if the booking ID does not exist
- Log the status transition in the server console: `[Status Change] Booking {id}: {oldStatus} → {newStatus}`

### 2.3 GET /api/payments — Payment Listing

**File:** `src/routes/payments.ts` (NEW)

**Plan:**
- Create a new Express router file for payment-related endpoints
- Implement `GET /api/payments` with pagination (20 per page) and optional filtering by `status` and `method`
- Include the related booking data via Prisma `include: { booking: { select: { id: true, live_meter_billing: true, status: true } } }`
- Return `{ data: Payment[], total_count: number, page: number }` structure
- Mount the router in `server.ts` at the `/api` prefix

### 2.4 POST /api/payments — Create Payment

**File:** `src/routes/payments.ts` (MODIFY — same new file)

**Plan:**
- Implement `POST /api/payments` with Zod validation
- Required fields: `booking_id` (valid UUID), `amount` (positive number), `method` (enum: Cash, Card, UPI, BankTransfer), `transaction_ref` (string, min 3 chars)
- Verify the referenced `booking_id` exists before creating the payment record
- Return the created payment with status `201`

### 2.5 GET /api/analytics/summary — Revenue Analytics

**File:** `src/routes/analytics.ts` (NEW)

**Plan:**
- Create a new Express router file for analytics endpoints
- Implement `GET /api/analytics/summary` accepting optional `from` and `to` date query params
- Use Prisma aggregation queries:
  - `prisma.chauffeurServiceHourlyBooking.count()` for total bookings
  - `prisma.payment.aggregate({ _sum: { amount: true } })` for total revenue
  - `prisma.chauffeurServiceHourlyBooking.aggregate({ _avg: { duration_hours: true } })` for average duration
  - `prisma.chauffeurServiceHourlyBooking.groupBy({ by: ['status'] })` for status distribution
- Return a structured `{ total_bookings, total_revenue, avg_duration, utilization_rate, status_breakdown }` JSON

---

## 3. Development Timeline

| Priority | Task | Estimated Effort | Dependency |
|:---|:---|:---|:---|
| 🔴 P0 | `PUT` update route + Zod validation | 1 hour | None |
| 🔴 P0 | `PATCH` status toggle route | 30 minutes | None |
| 🟡 P1 | Edit Booking modal (frontend) | 2 hours | PUT route |
| 🟡 P1 | Quick Status Toggle (frontend) | 1 hour | PATCH route |
| 🟡 P1 | Payments router (GET + POST) | 2 hours | None |
| 🟡 P1 | Payment Management UI | 3 hours | Payments router |
| 🟢 P2 | Analytics summary route | 1.5 hours | None |
| 🟢 P2 | Reports dashboard live data | 2 hours | Analytics route |
| 🟢 P2 | Loading skeletons + empty states | 1 hour | None |

**Total Estimated Remaining Effort:** ~14 hours
