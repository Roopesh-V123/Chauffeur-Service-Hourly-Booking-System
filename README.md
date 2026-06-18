# Chauffeur Service Hourly Booking System
### Client: Manivtha Tours & Travels | Lead Architect: V.Roopesh (ID: 252U1R1249)

This repository hosts the full-stack architecture for the Chauffeur Service Hourly Booking System, structured into distinct frontend and backend environments. 

---

## Local Development Setup

Follow these structured instructions to configure and execute both environments on your local machine.

### Prerequisites
* **Node.js** (v18.x or later recommended)
* **npm** (v9.x or later)
* **PostgreSQL** instance running locally or hosted

---

### Phase 1: Backend Setup & DB Migration

1. **Navigate to the Backend Directory**:
   Open a terminal prompt in the project root and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. **Install Backend Dependencies**:
   Restore all runtime and developer packages:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `/backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/chauffeur_db?schema=public"
   ```
   *Replace `YOUR_PASSWORD` and connection parameters to match your PostgreSQL instance.*

4. **Initialize Database and Schema Migrations**:
   Run the Prisma migration tool to generate the PostgreSQL tables and compile TypeScript client models:
   ```bash
   npx prisma migrate dev --name init
   ```
   *This automatically creates tables defined in `schema.prisma` and triggers client type generation.*

5. **Start the Express Development Server**:
   Start the Node development server with nodemon compilation watchers:
   ```bash
   npm run dev
   ```
   The backend will bootstrap and log:
   `[Server] Express server running on port 5000`

6. **Verify Server Health**:
   Submit a GET request using a browser or REST utility (e.g. Postman) to:
   ```http
   GET http://localhost:5000/health
   ```
   Confirm it returns:
   `{"status":"ok","project":"chauffeur-service-hourly-booki"}`

---

### Phase 2: Frontend Setup & Preview

1. **Navigate to the Frontend Directory**:
   Open a separate terminal prompt at the project root and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. **Install Frontend Dependencies**:
   Restore package definitions:
   ```bash
   npm install
   ```

3. **Launch the Next.js Dev Workspace**:
   Start the Next.js development compilation runner:
   ```bash
   npm run dev
   ```

4. **Access the Client Dashboard**:
   Open your browser and navigate to:
   ```http
   http://localhost:3000
   ```
   Verify that you see the premium **Navy Blue & Crisp White** dashboard featuring the **Hourly Booking Entry Form**, **Live Dashboard Table**, **Payment Billing Tracker**, and **Utilization Trends Mock Chart**.
