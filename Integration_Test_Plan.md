# Integration Test Plan
## Chauffeur Service Hourly Booking System
### Client: Manivtha Tours & Travels | Author: V.Roopesh (ID: 252U1R1249)

This document defines 8 end-to-end integration scenarios and 3 core business logic edge cases with exact mathematical verification.

---

## Part 1: End-to-End Integration Scenarios (8 Tests)

| Test ID | Scenario Name | Steps | Expected Result | Priority |
|:---|:---|:---|:---|:---|
| **INT-001** | **Create Booking → Verify on Dashboard** | 1. Submit Entry Form with `live_meter_billing: 1500`, `status: Active`, `created_date: 2026-06-09`, `notes: "Airport pickup"`. 2. Navigate to Dashboard. 3. Search for meter value `1500`. | Dashboard displays a row with meter = ₹1,500, status badge = "Active" (green), date = 09/06/2026. Total count increments by 1. | 🔴 Critical |
| **INT-002** | **Create Booking → View Detail** | 1. Create a booking via POST. 2. Click "View Detail" on the new row in the Dashboard. 3. Verify the detail modal content. | Detail modal shows all submitted fields: live meter value, status, created date, and notes. Customer and vehicle associations are displayed if linked. | 🔴 Critical |
| **INT-003** | **Create Booking → Calculate Fare** | 1. Create a booking with `duration_hours: 6`, `vehicle_category: "Luxury SUV"`. 2. Trigger the `/calculate` endpoint. 3. Verify the fare breakdown in the Core Logic Result card. | Result card displays: Base Fare = ₹10,800, applicable surcharges, GST = 18% of subtotal, and Grand Total. All values match the billing engine output. | 🔴 Critical |
| **INT-004** | **Update Booking → Verify Changes Persisted** | 1. Create a booking with `status: Active`. 2. Open the Edit Form. 3. Change `notes` to "VIP client - priority". 4. Save via PUT. 5. Reload dashboard and view detail. | Detail view shows updated notes = "VIP client - priority". All other fields remain unchanged. `updated_at` timestamp is more recent than `created_at`. | 🟡 High |
| **INT-005** | **Status Toggle: Active → Completed** | 1. Create a booking with `status: Active`. 2. Send PATCH to change status to `Completed`. 3. Verify on Dashboard. | Dashboard row shows status badge changed to "Completed" (blue). Server console logs `[Status Change] Booking {id}: Active → Completed`. | 🟡 High |
| **INT-006** | **Status Toggle: Active → Cancelled** | 1. Create a booking with `status: Active`. 2. Send PATCH to change status to `Cancelled`. 3. Filter dashboard by status = "Cancelled". | Filtered dashboard shows only cancelled bookings. The modified booking appears with "Cancelled" badge (red). Active bookings are hidden. | 🟡 High |
| **INT-007** | **Dashboard Pagination** | 1. Seed the database with 25 booking records. 2. Load the Dashboard (page 1). 3. Navigate to page 2. | Page 1 shows exactly 20 records. Page 2 shows exactly 5 records. The `total_count` in the API response = 25. Pagination controls reflect correct page numbers. | 🟢 Medium |
| **INT-008** | **Dashboard Search → Filter by Meter Value** | 1. Seed the database with bookings having meter values: 500, 1500, 2500, 1500. 2. Type "1500" in the search input. 3. Verify filtered results. | Dashboard filters to show only 2 records where `live_meter_billing` = 1500. Other records are hidden. Clearing the search restores all 4 records. | 🟢 Medium |

---

## Part 2: Core Business Logic Edge Cases (3 Tests)

### Edge Case 1: Sub-Minimum Duration Booking (Below 4-Hour Threshold)

**Scenario:** A customer books a Standard Sedan for only 1.5 hours starting at 2:00 PM (off-peak, non-night).

| Parameter | Value |
|:---|:---|
| Raw Duration | 1.5 hours |
| Vehicle Category | Standard Sedan |
| Hourly Rate | ₹800/hr |
| Start Time | 2:00 PM |

**Calculation:**

| Step | Operation | Result |
|:---|:---|:---|
| 1. Minimum Hour Enforcement | `Math.max(1.5, 4)` | **4 hours** (billed) |
| 2. Base Fare | 4 × ₹800 | **₹3,200.00** |
| 3. Peak Surcharge (08–11 AM, 05–08 PM) | 2:00 PM is off-peak → 0% | **₹0.00** |
| 4. Night Surcharge (10 PM–06 AM) | 2:00 PM is daytime → 0% | **₹0.00** |
| 5. Subtotal | ₹3,200 + ₹0 + ₹0 | **₹3,200.00** |
| 6. GST (18%) | ₹3,200 × 0.18 | **₹576.00** |
| 7. **Grand Total** | ₹3,200 + ₹576 | **₹3,776.00** |

**Key Verification:** Despite the customer using only 1.5 hours, they are billed for the 4-hour minimum. The total must be exactly **₹3,776.00**.

---

### Edge Case 2: Night Surcharge with Overtime (Beyond Minimum)

**Scenario:** A customer books a Premium Sedan for 7 hours starting at 11:00 PM (night window).

| Parameter | Value |
|:---|:---|
| Raw Duration | 7 hours |
| Vehicle Category | Premium Sedan |
| Hourly Rate | ₹1,200/hr |
| Start Time | 11:00 PM |

**Calculation:**

| Step | Operation | Result |
|:---|:---|:---|
| 1. Minimum Hour Enforcement | `Math.max(7, 4)` | **7 hours** (actual exceeds minimum) |
| 2. Base Fare | 7 × ₹1,200 | **₹8,400.00** |
| 3. Peak Surcharge (08–11 AM, 05–08 PM) | 11:00 PM is not peak → 0% | **₹0.00** |
| 4. Night Surcharge (10 PM–06 AM) | 11:00 PM is night → +20% of ₹8,400 | **₹1,680.00** |
| 5. Subtotal | ₹8,400 + ₹0 + ₹1,680 | **₹10,080.00** |
| 6. GST (18%) | ₹10,080 × 0.18 | **₹1,814.40** |
| 7. **Grand Total** | ₹10,080 + ₹1,814.40 | **₹11,894.40** |

**Key Verification:** The night surcharge applies to the full base fare (not just the overtime portion). The total must be exactly **₹11,894.40**.

---

### Edge Case 3: Peak + Maximum Duration Stress Test

**Scenario:** A customer books a Luxury SUV for 12 hours starting at 9:00 AM (peak window).

| Parameter | Value |
|:---|:---|
| Raw Duration | 12 hours |
| Vehicle Category | Luxury SUV |
| Hourly Rate | ₹1,800/hr |
| Start Time | 9:00 AM |

**Calculation:**

| Step | Operation | Result |
|:---|:---|:---|
| 1. Minimum Hour Enforcement | `Math.max(12, 4)` | **12 hours** (actual exceeds minimum) |
| 2. Base Fare | 12 × ₹1,800 | **₹21,600.00** |
| 3. Peak Surcharge (08–11 AM, 05–08 PM) | 9:00 AM is peak → +15% of ₹21,600 | **₹3,240.00** |
| 4. Night Surcharge (10 PM–06 AM) | 9:00 AM is daytime → 0% | **₹0.00** |
| 5. Subtotal | ₹21,600 + ₹3,240 + ₹0 | **₹24,840.00** |
| 6. GST (18%) | ₹24,840 × 0.18 | **₹4,471.20** |
| 7. **Grand Total** | ₹24,840 + ₹4,471.20 | **₹29,311.20** |

**Key Verification:** A 12-hour luxury booking during peak hours represents the upper bound of typical usage. The total must be exactly **₹29,311.20**. This stress-tests the multiplicative relationship between high duration, high rate, and peak surcharge.

---

## Test Execution Checklist

- [ ] All 8 integration scenarios executed and passed
- [ ] Edge Case 1 verified: ₹3,776.00 (sub-minimum billing)
- [ ] Edge Case 2 verified: ₹11,894.40 (night surcharge)
- [ ] Edge Case 3 verified: ₹29,311.20 (peak + stress test)
- [ ] All results documented in `test_tracker.md` with pass/fail status
- [ ] Screenshots captured for Review 2 evidence folder
