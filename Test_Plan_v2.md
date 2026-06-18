# Master Test Plan - Chauffeur Service Hourly Booking System
## Client: Manivtha Tours & Travels | System Architect: Principal Architect

This document details the Master Test Plan comprising exactly 24 test cases spanning across the Frontend, API, Database, and Core pricing logic layers.

---

| Test ID | Module | Description | Expected Result |
|:---|:---|:---|:---|
| **FT-001** | Frontend UI | Submitting booking form with empty `live_meter_and_billing`. | Form submission blocks; validation message displays: "Live meter and billing value is required." |
| **FT-002** | Frontend UI | Inputting a negative number (e.g. `-500`) in `live_meter_and_billing`. | Form submission blocks; validation message displays: "Must be a positive integer value." |
| **FT-003** | Frontend UI | Attempting to enter text strings inside the `live_meter_and_billing` field. | Browser input rejects non-numeric keystrokes or reports invalid numeric input block. |
| **FT-004** | Frontend UI | Leaving the `created_date` field empty and submitting the form. | Form submission blocks; validation message displays: "Created date is required." |
| **FT-005** | Frontend UI | Inspecting HTML drop-down element to check for exactly: "Active", "Completed", "Cancelled". | Dropdown options match requirements; no deprecated status options present. |
| **FT-006** | Frontend UI | Resizing browser layout down to mobile viewports (e.g., iPhone SE, 375px width). | Grid layout reflows into single column; no horizontal screen overflow or layout breakage. |
| **API-001** | API Routes | `POST /api/chauffeur_service_hourly_booking` with valid request payload. | Status code `201 Created` returned; response JSON includes booking UUID and populated model keys. |
| **API-002** | API Routes | `POST /api/chauffeur_service_hourly_booking` with negative `live_meter_and_billing`. | Status code `400 Bad Request` returned; response JSON contains a validation error message. |
| **API-003** | API Routes | `POST /api/chauffeur_service_hourly_booking` with invalid status value (e.g. `"Pending"`). | Status code `400 Bad Request` returned; response body outlines status validation constraints. |
| **API-004** | API Routes | `GET /api/chauffeur_service_hourly_booking` index route request. | Status code `200 OK` returned; returns JSON array containing paginated list of bookings. |
| **API-005** | API Routes | `GET /api/chauffeur_service_hourly_booking/:id` using a valid database UUID. | Status code `200 OK` returned; JSON payload correctly represents that booking record's values. |
| **API-006** | API Routes | `PUT /api/chauffeur_service_hourly_booking/:id` updating status field to `"Completed"`. | Status code `200 OK` returned; booking status field updated successfully in response payload. |
| **DB-001** | Database | Writing a valid booking record using Prisma Client insertion routines. | Row successfully inserted into `chauffeur_service_hourly_bookings` table; returns matching entity keys. |
| **DB-002** | Database | Inserting a booking record containing a non-existent `customer_id` UUID. | Database foreign key constraint fails; Prisma returns referential integrity violation code. |
| **DB-003** | Database | Inserting a booking record containing a non-existent `vehicle_id` UUID. | Database foreign key constraint fails; Prisma blocks write, throwing relative error code. |
| **DB-004** | Database | Deleting a parent `Customer` record containing active bookings. | Cascase delete applies; all child records of the deleted customer are purged from the database. |
| **DB-005** | Database | Inserting a vehicle record with an already existing `plate_number`. | Database unique key constraint fails; database rejects insertion, returning unique error. |
| **DB-006** | Database | Attempting to write a booking record with a null value inside `created_date`. | Database non-nullable constraint fails; system blocks write, database rejects insert. |
| **LOG-001** | Core Logic | Calculating booking pricing for a 2-hour duration (under 4-hour limit). | Calculation rounded to 4 hours; total base charge matches category base rate $\times$ 4. |
| **LOG-002** | Core Logic | Calculating pricing for a 5-hour duration within the peak traffic window (e.g. 09:00 AM). | Surcharge computed at +15% of the base hourly rate for the peak hours; total cost matches calculation. |
| **LOG-003** | Core Logic | Calculating pricing for a 4-hour duration inside night shift hours (e.g., 11:00 PM - 03:00 AM). | Surcharge computed at +20% of the base rate for night hours; total cost matches calculation. |
| **LOG-004** | Core Logic | Evaluating a trip spanning both peak and night hours (e.g. 07:00 PM to 11:00 PM). | 07:00-08:00 receives +15% peak; 10:00-11:00 receives +20% night; cumulative sum added correctly. |
| **LOG-005** | Core Logic | Tax assessment test check on final calculated billing total. | Standard GST of 18% applied programmatically to the sum of the base fare and dynamic surcharges. |
| **LOG-006** | Core Logic | Processing a cancellation action occurring 1 hour prior to scheduled pickup time. | Late cancellation penalty fee is charged, matching the 4-hour minimum base charge. |
