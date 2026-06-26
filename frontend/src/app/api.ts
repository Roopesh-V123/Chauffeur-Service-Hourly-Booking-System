/**
 * @file api.ts
 * @description Central API base URL configuration.
 * - In development (npm run dev): reads NEXT_PUBLIC_API_URL from .env.local → http://localhost:5000
 * - In production (Vercel/deployment): reads NEXT_PUBLIC_API_URL from .env.production → Render URL
 *
 * This eliminates the 40-60 second Render cold-start delay during local development
 * by routing all requests to the locally running backend on port 5000.
 *
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://chauffeur-service-hourly-booking-system.onrender.com";
