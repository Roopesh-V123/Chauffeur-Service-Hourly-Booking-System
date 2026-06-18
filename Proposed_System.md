# Proposed System Architecture & Frontend Layout
## Client: Manivtha Tours & Travels | Design System: Antigravity UI

This document details the functional specifications for the 4 core application screens and provides a comparative review of the manual-to-digital transition.

---

## 1. Frontend Screen Layouts

The frontend application is constructed using a premium, professional **Navy Blue and Crisp White** color scheme, ensuring maximum clarity, high contrast, and a frictionless experience for reservation operators and admins.

### Screen 1: Hourly Booking Entry Form
* **Purpose**: Allows reservation desk operators to register and schedule new chauffeur hire bookings.
* **Actors**: Reservation Operators, Dispatch Officers.
* **Inputs**:
  * `customer_id` (Searchable select dropdown)
  * `vehicle_id` (Select dropdown matching active fleet category)
  * `live_meter_and_billing` (Numeric input for booking price calculation, ₹)
  * `status` (Select dropdown: `Active`, `Completed`, `Cancelled`)
  * `created_date` (Date picker)
  * `notes` (Textarea for route specifics or client requirements)
* **Outputs**: Form confirmation, simulated invoice calculation preview, and record persistence in PostgreSQL.
* **Aesthetic Feel**: Clean glassmorphism cards (`bg-white/80` with `backdrop-blur`), subtle gray outlines (`border-slate-200`), bold Navy Blue (`#0B132B`) buttons, and high-visibility input focus indicators.

### Screen 2: Live Dashboard
* **Purpose**: Serves as the real-time operational monitor for all chauffeur trips.
* **Actors**: Fleet Dispatchers, Customer Support Agents, Managers.
* **Inputs**:
  * Search bar (matches customer name or booking ID)
  * Status filter pills (`All`, `Active`, `Completed`, `Cancelled`)
* **Outputs**: A responsive database table of active/scheduled trips with status badges, and quick-action buttons (`Edit`, `View Details`).
* **Aesthetic Feel**: Minimalist data grid with high typographic contrast. Hovering over a row triggers a subtle slate transition (`hover:bg-slate-50`). Statuses utilize soft colored borders for instant visual feedback.

### Screen 3: Payment & Billing Tracker
* **Purpose**: Tracks corporate client accounts, invoice generation, and settlement status.
* **Actors**: Billing Specialists, Finance Clerks.
* **Inputs**:
  * Booking Reference Search
  * Settlement Action (e.g., mark as `Paid`, apply discount voucher)
* **Outputs**: Breakdown of fares (Base Rate $\times$ Hours, Peak Surcharges, Night Surcharges, 18% GST) and invoice printing layouts.
* **Aesthetic Feel**: High-contrast layout replicating a premium travel ticket. Uses clean lines, structured columns, and displays the **Grand Total** in extra-large, ultra-bold Navy Blue font for emphasis.

### Screen 4: Reports & Analytics
* **Purpose**: Evaluates operational statistics, chauffeur utilization rates, and revenue trends.
* **Actors**: Branch Managers, Managing Directors.
* **Inputs**:
  * Date range selector (e.g., Weekly, Monthly, YTD)
  * Fleet category filter
* **Outputs**: Graphic visualizations (utilization bars, revenue lines) and summary metrics tiles.
* **Aesthetic Feel**: Modern tiled dashboard. Data charts use clean blue, gold, and cyan accent colors. Avoids visual clutter, maintaining crisp margins and large typographic values.

---

## 2. Process Comparison Matrix

The transition from the manual operations at Manivtha Tours & Travels to the digital Chauffeur Booking Platform resolves manual errors and calculations delays:

| Process / Operation | Current Manual Process (Excel & Ledger) | Proposed Digital System |
|:---|:---|:---|
| **Booking Intake** | Written down in paper journals or manually entered into unstructured Excel rows. | Structured web form with auto-complete selectors and mandatory fields. |
| **Duration Calculation** | Calculated manually by operators; prone to error when trips extend or cross midnight. | Duration and fare values computed instantly by the backend engine based on timestamps. |
| **Surcharge Applications** | Surcharges for peak traffic hours and night shifts are remembered and added manually, leading to billing disputes. | The billing engine automatically calculates and appends peak-hour (+15%) and night (+20%) surcharges mathematically. |
| **Invoice Dispatch** | Operators manually copy data into a Word document template, convert to PDF, and email it. | System automatically generates a PDF invoice on status transition and emails it directly. |
| **Fleet Monitoring** | Dispatchers call chauffeurs via phone to check status and location. | Real-time dashboard lists all current chauffeur statuses (`Active`, `Completed`, `Cancelled`) instantly. |
| **Monthly Reports** | Ledger tallies are consolidated manually at the end of the month to calculate driver commissions. | Live analytics panel displays real-time utilization graphs, total revenue, and chauffeur metrics instantly. |
