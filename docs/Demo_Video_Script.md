# Demo Video Script & Navigation Guide
## Chauffeur Service Hourly Booking System
### Client: Manivtha Tours & Travels
### Presenter: V.Roopesh (ID: 252U1R1249)
### Length: 5 Minutes (Approx. 4:30 - 5:00)

---

### Phase 1: Introduction & System Context
* **Timestamp**: `0:00 - 0:45`
* **Visual Action**: 
  * Open browser window displaying the Next.js home landing screen. The interface has a premium Navy Blue and Crisp White theme. 
  * Hover cursor over the navigation tabs (Dashboard, Reservation Form, Payments, Reports) and display the author info header containing "V.Roopesh (252U1R1249)" at the top right of the application panel.
* **Spoken Narration**:
  > "Hello everyone. My name is V.Roopesh, Student ID 252U1R1249. Today I am demonstrating the Chauffeur Service Hourly Booking System, developed for Manivtha Tours & Travels. 
  > Before this deployment, Manivtha Tours & Travels managed hourly luxury reservations manually. This led to errors in applying billing rates, dynamic surcharges, and tax rates. 
  > To address these inefficiencies, we built a fully responsive web application using Next.js, Express, and PostgreSQL, designed on the Antigravity Navy Blue and Crisp White aesthetic. Let's walk through the core features of the system."

---

### Phase 2: Reservation Entry Form & Real-time Billing Calculations
* **Timestamp**: `0:45 - 1:45`
* **Visual Action**:
  * Click on the **Reservation Form** tab. The UI transitions to the entry form.
  * Select a Customer name, choose a Vehicle Category (e.g., **Luxury SUV**), enter duration as **3 hours**, set start time to **10:00 AM**, and select today's date.
  * Point cursor to the **Billing Panel** on the right side of the screen. Show that the duration is rounded up to **4 hours** (minimum spacing rule) and a **15% Peak Hours Surcharge** is active (10:00 AM is inside the peak window).
  * Change duration to **5 hours** and Vehicle Category to **Premium Sedan** starting at **11:00 PM**. Point out the updated billing summary showing **20% Night Shift Surcharge** active.
  * Click **Submit Reservation**. A toast notification appears in the top-right corner, confirming successful booking creation.
* **Spoken Narration**:
  > "First, we navigate to the Reservation Entry Form. Watch how the real-time billing panel reacts as I input data. 
  > If I attempt to request a Sedan for 3 hours, the engine automatically rounds it up to 4 hours to enforce our operational minimum spacing limit. 
  > Notice that because the start time is set to 10:00 AM, a 15% peak surcharge is automatically added. 
  > Let's change the parameters. Choosing a Sedan for 5 hours at 11:00 PM swaps the peak surcharge for a 20% night shift premium. The 18% GST is computed instantly. 
  > I'll write a note for the driver: 'VIP Client Airport Pickup', and click Submit. The client-side validation passes, and the booking is saved to the database."

---

### Phase 3: Operational Dashboard, Searching, and Status Changes
* **Timestamp**: `1:45 - 2:30`
* **Visual Action**:
  * Click on the **Dashboard** tab.
  * Scroll down to see the table containing bookings with color-coded status badges: Green for Active, Blue for Completed, Red for Cancelled.
  * Locate the search input box at the top. Type the customer ID or meter parameters to isolate our newly created booking record.
  * Click the **Action** button on our active booking row. Select **Mark as Completed** or **PATCH Status**. The status badge changes instantly from green to blue.
* **Spoken Narration**:
  > "Now we enter the Operational Dashboard. This central workspace displays live booking logs retrieved from PostgreSQL. 
  > Every record features a clean, status-colored badge representing its operational phase. 
  > To find a record quickly, managers can use the search bar. Typing 'VIP' instantly filters the table. 
  > When the tour ends, the dispatcher clicks the Action button and sets the status to 'Completed'. The backend processes the patch request in under 50ms, updating the database and refreshing the dashboard view."

---

### Phase 4: Joined Detail Specification Sheet & Printing
* **Timestamp**: `2:30 - 3:15`
* **Visual Action**:
  * Click the **View Detail** button on the booking row we just completed.
  * A full-page sub-view slides in, rendering the unified invoice details.
  * Scroll through to show the joined customer metadata, assigned vehicle plates, payment history, and audit timeline.
  * Click the **Print / Export Details** button. The browser's native print modal opens, displaying a clean black-and-white grid template with no navigation sidebars. Click Cancel to return.
* **Spoken Narration**:
  > "Next, clicking 'View Detail' loads the Joined Detail Specification Sheet. 
  > The Express backend runs a joined query, fetching related customer details, assigned fleet details, and invoices. 
  > This page acts as a digital audit file. If the client demands a physical invoice copy, clicking the 'Print Details' button triggers our custom print stylesheet. 
  > It hides all dashboard navigation items, rendering a clean, document-ready invoice template suitable for immediate exporting to PDF."

---

### Phase 5: Reports, SVG Charting, and Empty States
* **Timestamp**: `3:15 - 4:00`
* **Visual Action**:
  * Click on the **Reports & Analytics** tab.
  * Hover cursor over the KPI aggregate metric cards (Total revenue, hours, counts) at the top.
  * Hover over the points on the SVG Line Chart to show interactive coordinates and tooltips updating dynamically.
  * Adjust date filters to a future date range to trigger the `EmptyStateMessage` dashboard fallback. Show the clean centered message: "No operational data found for this period."
* **Spoken Narration**:
  > "To provide business insights, we open the Reports and Analytics portal. 
  > Key metrics are aggregated here at the top, showing overall total revenue, billed hours, and fleet utilisation. 
  > The interactive SVG line graph tracks revenue over a 30-day time-series. Moving the cursor over the data points displays accurate tooltips. 
  > If I filter by a future date range containing zero transactions, the system remains stable. Instead of throwing errors, it displays a clean, accessibility-compliant Empty State Message."

---

### Phase 6: Mobile Responsive Inspection & QA Sign-off
* **Timestamp**: `4:00 - 5:00`
* **Visual Action**:
  * Press `F12` to open Chrome Developer Tools. Click the device toggle to simulate a mobile viewport of **375px** (iPhone SE/12 Pro).
  * Scroll down the mobile layout. Show that:
    * The sidebar collapses into a slide-out drawer or top-nav panel.
    * The KPI metric cards stack vertically.
    * Large tables feature a horizontal scroll wrapper, showing a small swipe indicator.
    * Buttons fit within the 375px width, maintaining large tap targets.
  * Exit Developer Tools and display the slide script or `test_tracker.md` summary showing the 33/33 pass rate.
* **Spoken Narration**:
  > "Finally, let's inspect the system's responsiveness. Simulating a 375px viewport, you can see how the layout adapts. 
  > Sidebar menus collapse, metrics stack, and data tables scroll horizontally without breaking the page. 
  > Buttons maintain a minimum 44px tap target size to ensure high usability for drivers and coordinators on the move.
  > The entire codebase has been verified against a 33-case test suite, achieving a 100% pass rate. 
  > The system has been deployed on production servers and is ready for release. 
  > This concludes our demonstration. Thank you for watching."
