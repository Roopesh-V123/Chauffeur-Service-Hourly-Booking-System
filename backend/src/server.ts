/**
 * @file server.ts
 * @description Root entrypoint for the Chauffeur Service Hourly Booking System Express API backend.
 * Bootstraps routes, initializes middleware (CORS, body parser, input sanitizer), mounts controllers, 
 * configures global error bounds, and binds to the specified port interface.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */

import express, { Request, Response } from "express";
import cors from "cors";
import bookingRouter from "./routes/booking";
import paymentRouter from "./routes/payments";
import reportsRouter from "./routes/reports";
import dashboardRouter from "./routes/dashboard";
import customersRouter from "./routes/customers";
import vehiclesRouter from "./routes/vehicles";
import { sanitizeInput, globalErrorHandler } from "./middleware/errorAndSanitizer";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(sanitizeInput);

// Mount the booking routes endpoint
app.use("/api/chauffeur_service_hourly_booking", bookingRouter);

// Mount the payment routes endpoint
app.use("/api/payments", paymentRouter);

// Mount the reports routes endpoint
app.use("/api/reports", reportsRouter);

// Mount the dashboard summary endpoint
app.use("/api/dashboard", dashboardRouter);

// Mount the customer routes endpoint
app.use("/api/customers", customersRouter);

// Mount the vehicle routes endpoint
app.use("/api/vehicles", vehiclesRouter);

// GET /health route returning exact requested payload
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    project: "chauffeur-service-hourly-booki"
  });
});

// Mount global error handler last in the Express stack
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`[Server] Express server running on port ${PORT}`);
});




