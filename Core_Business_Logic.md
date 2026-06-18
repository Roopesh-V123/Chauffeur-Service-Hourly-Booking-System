# Core Business Logic Engine Specifications
## Client: Manivtha Tours & Travels | System Architect: Principal Architect

This document details the operational rules, pricing calculations, thresholds, validation guidelines, and edge-case handling guidelines for the Chauffeur Service Hourly Booking engine.

---

## 1. Billing Tiers & Base Pricing Structure

All hourly bookings are calculated using a tiered hourly model depending on the selected vehicle class:

| Vehicle Class | Base Hourly Rate (₹) | Minimum Booking Hours | Minimum Base Charge (₹) |
|:---|:---|:---|:---|
| **Premium Sedan** | ₹1,200 / hour | 4 Hours | ₹4,800 |
| **Luxury SUV** | ₹1,800 / hour | 4 Hours | ₹7,200 |
| **Executive Van** | ₹2,500 / hour | 4 Hours | ₹10,000 |

### 1.1 Minimum Hour Rule
* If the user selects a duration less than the **4-hour minimum threshold**, the system automatically rounds up the billing duration to exactly **4 hours** for price calculations.
* The actual chauffeur dispatch duration can be shorter, but the billing parameter remains bound to the 4-hour minimum.

---

## 2. Dynamic Surcharge Calculations

To handle peak traffic and late-night operations, the core logic applies time-dependent multipliers to the base hourly rate.

### 2.1 Peak-Hour Surcharge (+15%)
* **Active Windows**: `08:00 AM - 11:00 AM` and `05:00 PM - 08:00 PM`.
* **Calculation Rule**: Any hourly block or fraction of an hour occurring within these windows receives a **+15% surcharge** applied to the base rate.
* **Formula**: $\text{Peak Surcharge} = \text{Base Hourly Rate} \times 0.15 \times \text{Peak Hours}$

### 2.2 Night-Time Surcharge (+20%)
* **Active Window**: `10:00 PM - 06:00 AM` (of the following day).
* **Calculation Rule**: Any hourly block or fraction of an hour occurring within this window receives a **+20% surcharge** applied to the base rate.
* **Formula**: $\text{Night Surcharge} = \text{Base Hourly Rate} \times 0.20 \times \text{Night Hours}$

### 2.3 Cumulative Surcharge Handling
* Surcharges are computed **independently** on the base rate and are added together. They are not compounded.
* **Total Hourly Cost** = $\text{Base Rate} + \text{Peak Surcharge} + \text{Night Surcharge}$

---

## 3. Taxation Model (GST)

* A standard **18% Goods & Services Tax (GST)** is applied to the final calculated amount (Base Fare + Surcharges).
* **Final Billing Total** = $(\text{Total Base Fare} + \text{Surcharges}) \times 1.18$

---

## 4. Input Validation & Constraints

| Parameter | Validation Rule | Action on Violation |
|:---|:---|:---|
| `live_meter_and_billing` | Must be a positive integer ($\gt 0$). | Reject request, return status code `400 Bad Request`. |
| `status` | Must belong to: `["Active", "Completed", "Cancelled"]`. | Reject request, return status code `400 Bad Request`. |
| `created_date` | Must be a valid date and cannot be in the past relative to system clock. | Reject request, return status code `400 Bad Request`. |
| `customer_id` | Must exist as an active record in the database. | Reject request, return status code `400 Bad Request`. |
| `vehicle_id` | Must exist as an active record in the database. | Reject request, return status code `400 Bad Request`. |

---

## 5. Handling Complex Edge Cases

### 5.1 Multi-Day / Cross-Midnight Sessions
If a booking spans across midnight (e.g., from 09:00 PM to 02:00 AM):
* The logic splits the session into hourly segments.
* Segment 1: `09:00 PM - 10:00 PM` (billed at Base Rate).
* Segment 2: `10:00 PM - 02:00 AM` (billed at Base Rate + 20% Night Surcharge).

### 5.2 Real-time Extensions
If an active booking exceeds its scheduled limit:
* The system transitions the booking status to `Active` and calculates the additional elapsed duration.
* Extended hours are billed dynamically at the standard base hourly rate plus any active surcharge multipliers matching the extended timeframe.

### 5.3 Late Cancellation Charge
* If a booking is cancelled **less than 2 hours** prior to the scheduled pickup time, the customer is billed a cancellation penalty equivalent to the **4-hour minimum base charge** of the selected vehicle class.
