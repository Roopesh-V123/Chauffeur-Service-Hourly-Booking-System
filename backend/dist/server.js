"use strict";
/**
 * @file server.ts
 * @description Root entrypoint for the Chauffeur Service Hourly Booking System Express API backend.
 * Bootstraps routes, initializes middleware (CORS, body parser, input sanitizer), mounts controllers,
 * configures global error bounds, and binds to the specified port interface.
 *
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const booking_1 = __importDefault(require("./routes/booking"));
const payments_1 = __importDefault(require("./routes/payments"));
const reports_1 = __importDefault(require("./routes/reports"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const customers_1 = __importDefault(require("./routes/customers"));
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const errorAndSanitizer_1 = require("./middleware/errorAndSanitizer");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(errorAndSanitizer_1.sanitizeInput);
// Mount the booking routes endpoint
app.use("/api/chauffeur_service_hourly_booking", booking_1.default);
// Mount the payment routes endpoint
app.use("/api/payments", payments_1.default);
// Mount the reports routes endpoint
app.use("/api/reports", reports_1.default);
// Mount the dashboard summary endpoint
app.use("/api/dashboard", dashboard_1.default);
// Mount the customer routes endpoint
app.use("/api/customers", customers_1.default);
// Mount the vehicle routes endpoint
app.use("/api/vehicles", vehicles_1.default);
// GET /health route returning exact requested payload
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        project: "chauffeur-service-hourly-booki"
    });
});
// Mount global error handler last in the Express stack
app.use(errorAndSanitizer_1.globalErrorHandler);
app.listen(PORT, () => {
    console.log(`[Server] Express server running on port ${PORT}`);
});
