# Comprehensive Production Deployment Guide
## Client: Manivtha Tours & Travels | System Administrator: V.Roopesh (ID: 252U1R1249)

This guide provides instructions to compile, migrate, and deploy the Chauffeur Service Hourly Booking System monorepo to cloud hosting platforms.

---

### Live Application URLs
* **Live Frontend Interface (Vercel)**: `https://[placeholder-your-vercel-domain].vercel.app`
* **Live Backend API Gateway (Render)**: `https://[placeholder-your-render-domain].onrender.com`

---

## 1. Production Environment Variables Matrix

The following parameters must be configured in the respective hosting dashboard panels. **Never commit raw credentials to version control.**

| Service | Environment Variable | Required | Description / Recommended Value |
|:---|:---|:---|:---|
| **Backend** | `DATABASE_URL` | Yes | The PostgreSQL database connection URI string. Automatically managed by Render Blueprints. |
| **Backend** | `PORT` | Yes | Port on which the API gateway listens. Recommended: `5000` (Render binds this dynamically). |
| **Backend** | `NODE_ENV` | Yes | Set to `production` to optimize Express error traces and dependencies. |
| **Frontend** | `NEXT_PUBLIC_API_URL` | Yes | The live backend API URL (e.g., `https://chauffeur-booking-backend-api.onrender.com`). Do not append a trailing slash. |

---

## 2. Backend & Database Deployment (Render + PostgreSQL)

We deploy the Express backend and PostgreSQL database using **Render Blueprint** infrastructure-as-code mappings.

### Steps:
1. Log in to the [Render Dashboard](https://render.com).
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository containing the monorepo.
4. Render will parse the `render.yaml` file in the root workspace folder:
   - It instantiates a secure **PostgreSQL Database** (`chauffeur-prod-db`).
   - It maps a **Web Service** (`chauffeur-booking-backend-api`) bound to the `/backend` directory.
   - It wires the database credentials (`DATABASE_URL`) directly into the Web Service environment.
5. During compilation, Render runs the build command:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
6. Before launching the Node process, Render executes production migrations:
   ```bash
   npx prisma migrate deploy && npm start
   ```
   > [!IMPORTANT]
   > `prisma migrate deploy` is the safe, non-destructive migration command for production databases. It applies pending SQL schemas without prompting database resets or wiping existing logs.

---

## 3. Frontend Deployment (Vercel)

The Next.js client is optimized for deployment on Vercel's edge network.

### Steps:
1. Log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. Configure the Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
5. Expand the **Environment Variables** panel and add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://[your-backend-service].onrender.com` (your live Render API gateway URL)
6. Click **Deploy**. Vercel will typecheck and build your Next.js application.

---

## 4. Local Production Build Verification

Verify that compilation, linting, and assets compile correctly locally before pushing code changes to production.

### Backend Verification:
Run these commands inside the `/backend` directory:
```bash
# Clean install dependencies
npm install

# Compile TypeScript code
npm run build

# Start the compiled production build
npm run start
```

### Frontend Verification:
Run these commands inside the `/frontend` directory:
```bash
# Clean install dependencies
npm install

# Verify type safety and compile production bundle
npm run build

# Run local production server
npm run start
```
Verify that the output displays zero ESLint errors, no TypeScript type checking failures, and outputs compiled chunks successfully.
