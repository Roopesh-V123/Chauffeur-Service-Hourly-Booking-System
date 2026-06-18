# Project Objectives - Manivtha Tours & Travels
## Chauffeur Service Hourly Booking System

This document outlines the 5 clear, testable objectives for each of the three student roles participating in the development of the Chauffeur Service Hourly Booking System.

---

### Student 1 (Frontend Developer)
**Focus:** User perspective, UI/UX (Google Antigravity style), Navy Blue & Crisp White aesthetic, and the 4 main screens.

1. **Brand Aesthetic & Accessibility**: Implement a premium, responsive user interface using a Navy Blue (`#0B132B`, `#1C2541`) and Crisp White (`#FFFFFF`, `#F8FAFC`) color palette, achieving a Lighthouse Accessibility (a11y) score of $\ge 90$.
2. **Robust Form Entry**: Build the `ChauffeurServiceHourlyBookingEntryForm` with complete client-side validation, ensuring booking submissions cannot contain past dates, invalid durations, or empty chauffeur categories.
3. **Responsive Visual Performance**: Ensure that all 4 main screens are fluidly responsive across standard viewport sizes (375px mobile to 1920px desktop), with zero horizontal layout overflows and seamless navigation.
4. **Calculations & Billing UX**: Develop the `PaymentBillingTracker` UI to display real-time pricing updates (including base fare, tax, and surcharges) with a UI response latency under 200ms when hours or vehicle types are adjusted.
5. **Insights & Analytics Presentation**: Build the `ReportsAnalyticsDashboard` with interactive visual aids (charts or key performance indicators), ensuring that critical booking trends load in under 1 second on mobile networks.

---

### Student 2 (Backend Developer)
**Focus:** Core business logic engine, API architecture, and database performance.

1. **Standardized API Structure**: Design and implement RESTful API endpoints for booking operations, returning unified JSON structures and standard HTTP status codes (200 OK, 201 Created, 400 Bad Request, 500 Internal Server Error).
2. **Business Rules Execution**: Program a bulletproof booking pricing engine that correctly processes core business rules (e.g., 4-hour minimum booking limit, peak-hour surcharges of +15%, and night-time booking rates of +20%) with 100% mathematical accuracy.
3. **High-Performance Endpoints**: Optimise API query execution and logic routines to ensure response times remain below 150ms for 95% of queries under a simulated load of 50 concurrent requests.
4. **Query & Schema Optimization**: Design and index database tables (such as indexes on booking dates, customer IDs, and chauffeur status flags) so that read queries for active chauffeur availability execute in under 50ms.
5. **Secure Input Verification**: Implement request schema validation using middleware on all routes to check and block malformed, oversized, or malicious request payloads before they reach business logic components.

---

### Student 3 (Testing & Deployment Developer)
**Focus:** Core logic verification, regression testing, and deployment pipelines.

1. **High Test Coverage**: Set up an automated testing framework (e.g., Jest or Mocha) to verify the pricing calculation engine, achieving a minimum of 80% line-of-code coverage.
2. **Edge-Case Validation**: Author at least 10 distinct automated test cases to prevent calculation regression, covering boundary conditions such as exactly the minimum hour threshold, cross-day booking durations, invalid coupon codes, and negative inputs.
3. **API Integrity Verification**: Build and maintain a Postman collection covering all backend endpoints with automated test assertions checking status codes, JSON schema correctness, and health statuses.
4. **Continuous Integration Pipeline**: Set up a CI pipeline that triggers on every pull request to automatically run code compilation, linting, and the entire test suite, failing the build if any step reports an error.
5. **Consistent Dev-to-Prod Environments**: Containerise the backend and frontend configurations using docker configuration files to guarantee that environment setups are identical across local development, testing, and production instances.
