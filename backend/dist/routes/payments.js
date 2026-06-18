"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const zod_1 = require("zod");
// Author: V.Roopesh (ID: 252U1R1249)
// Route definitions for payment CRUD operations linked to chauffeur bookings
const paymentRouter = (0, express_1.Router)();
// Zod schema for payment creation
const createPaymentSchema = zod_1.z.object({
    booking_id: zod_1.z.string().uuid("Booking ID must be a valid UUID"),
    amount: zod_1.z.number().positive("Payment amount must be a positive number"),
    method: zod_1.z.enum(["Cash", "Card", "UPI", "BankTransfer"]),
    transaction_reference: zod_1.z.string().min(3, "Transaction reference must be at least 3 characters").optional(),
});
/**
 * GET /api/payments
 * Lists all payment records with pagination and optional filtering by status and method.
 * Includes related booking data for cross-reference.
 * @author V.Roopesh (ID: 252U1R1249)
 */
paymentRouter.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const statusQuery = req.query.status;
        const methodQuery = req.query.method;
        const whereClause = {};
        // Filter by payment status if provided
        if (statusQuery && ["Pending", "Paid", "Failed"].includes(statusQuery)) {
            whereClause.status = statusQuery;
        }
        // Filter by payment method if provided
        if (methodQuery && ["Cash", "Card", "UPI", "BankTransfer"].includes(methodQuery)) {
            whereClause.method = methodQuery;
        }
        const [payments, totalCount] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.payment.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: "desc"
                },
                skip: skip,
                take: limit,
                include: {
                    booking: {
                        select: {
                            id: true,
                            liveMeterAndBilling: true,
                            status: true,
                            createdDate: true,
                            notes: true
                        }
                    }
                }
            }),
            prisma_1.prisma.payment.count({
                where: whereClause
            })
        ]);
        res.status(200).json({
            success: true,
            data: payments,
            total_count: totalCount,
            page: page,
            limit: limit
        });
    }
    catch (error) {
        console.error("[GET /api/payments] Fetch payments failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
/**
 * POST /api/payments
 * Creates a new payment record linked to an existing booking.
 * Validates that the booking_id exists before persisting.
 * @author V.Roopesh (ID: 252U1R1249)
 */
paymentRouter.post("/", async (req, res) => {
    try {
        const body = createPaymentSchema.parse(req.body);
        // Verify the referenced booking exists
        const bookingExists = await prisma_1.prisma.chauffeurServiceHourlyBooking.findUnique({
            where: { id: body.booking_id }
        });
        if (!bookingExists) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "The referenced booking does not exist."
            });
            return;
        }
        const payment = await prisma_1.prisma.payment.create({
            data: {
                bookingId: body.booking_id,
                amount: body.amount,
                status: "Pending",
                transactionReference: body.transaction_reference || null,
            },
            include: {
                booking: {
                    select: {
                        id: true,
                        liveMeterAndBilling: true,
                        status: true
                    }
                }
            }
        });
        console.log(`[POST /api/payments] Payment ${payment.id} created for booking ${body.booking_id}.`);
        res.status(201).json({
            success: true,
            message: "Payment record created successfully.",
            data: payment
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: "Validation Error",
                details: error.flatten().fieldErrors
            });
            return;
        }
        console.error("[POST /api/payments] Payment creation failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
exports.default = paymentRouter;
