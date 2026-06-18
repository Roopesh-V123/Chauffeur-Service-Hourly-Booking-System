# API Specifications v2 - Chauffeur Service Hourly Booking System
### Client: Manivtha Tours & Travels | System Architect: Principal Architect

This document details the refined API specifications following the Review 1 feedback cycle. It outlines the schema requirements for the core entities and defines strict request validations.

---

## 1. Core Database Entities

The backend services interact with 4 core database entities:

| Entity Name | Primary Key | Description |
|:---|:---|:---|
| `chauffeur_service_hourly_booking` | `id` (UUID) | Records the active chauffeur hiring session. |
| `payments` | `id` (UUID) | Details transactional and billing ledger outputs. |
| `customers` | `id` (UUID) | Contains client/corporate accounts data. |
| `vehicles` | `id` (UUID) | Defines fleet items (e.g. Sedans, SUVs, Vans). |

---

## 2. API Endpoint Layout

All route schemas adhere to REST patterns under the `/api` namespace prefix.

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|
| **POST** | `/api/chauffeur_service_hourly_booking` | Create a new hourly booking. | Yes |
| **GET** | `/api/chauffeur_service_hourly_booking` | List bookings with pagination & search. | Yes |
| **GET** | `/api/chauffeur_service_hourly_booking/:id` | Fetch details of a single booking. | Yes |
| **PUT** | `/api/chauffeur_service_hourly_booking/:id` | Edit/Update status and meter details. | Yes |

---

## 3. Request Validation: `POST /api/chauffeur_service_hourly_booking`

Creates an instance of an hourly booking session.

### JSON Request Payload Body
```json
{
  "live_meter_and_billing": 5000,
  "status": "Active",
  "created_date": "2026-06-09",
  "notes": "Premium airport terminal pickup with luxury sign board."
}
```

### Request Payload Validation Matrix

| Field | Type | Required | Constraints / Validation |
|:---|:---|:---|:---|
| `live_meter_and_billing` | Number | **Yes** | Must be a **positive integer** ($\gt 0$). Rejects floats and negative values. |
| `status` | String | **Yes** | Must match exactly one of: `["Active", "Completed", "Cancelled"]`. |
| `created_date` | String (Date) | **Yes** | Must be a valid date string in ISO format (`YYYY-MM-DD`). |
| `notes` | String | No | Maximum length: 500 characters. Sanitized to prevent XSS injections. |

### JSON Response Profiles

#### Successful Creation (`201 Created`)
```json
{
  "success": true,
  "message": "Booking entry created successfully.",
  "data": {
    "id": "e229fb63-7eb6-4c4f-9e7f-b0f37c3558d1",
    "live_meter_and_billing": 5000,
    "status": "Active",
    "created_date": "2026-06-09T00:00:00.000Z",
    "notes": "Premium airport terminal pickup with luxury sign board.",
    "updated_at": "2026-06-09T06:11:00.000Z"
  }
}
```

#### Validation Failure (`400 Bad Request`)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": {
    "live_meter_and_billing": "Value must be a positive integer."
  }
}
```
