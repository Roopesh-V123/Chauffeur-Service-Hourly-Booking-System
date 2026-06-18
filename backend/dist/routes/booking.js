"use strict";
/**
 * @file booking.ts
 * @description Router implementing CRUD endpoints, dynamic pricing calculators, and status mutation lifecycles
 * for chauffeur hourly bookings in the PostgreSQL DB via Prisma.
 *
 * @author V.Roopesh (ID: 252U1R1249)
 * @client Manivtha Tours & Travels
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const zod_1 = require("zod");
const billingEngine_1 = require("../services/billingEngine");
const bookingRouter = (0, express_1.Router)();
/**
 * @type {z.ZodObject} createBookingSchema
 * @description Zod schema for validating booking creation request payloads.
 * Ensures data matches relational model structures.
 */
const createBookingSchema = zod_1.z.object({
    live_meter_and_billing: zod_1.z.number().positive("Live meter and billing must be a positive number"),
    status: zod_1.z.enum(["Active", "Completed", "Cancelled"]),
    created_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format (must be YYYY-MM-DD)"
    }),
    notes: zod_1.z.string().min(1, "Notes cannot be empty"),
    customer_id: zod_1.z.string().uuid().optional(),
    vehicle_id: zod_1.z.string().uuid().optional(),
});
/**
 * @route GET /api/chauffeur_service_hourly_booking
 * @description Lists bookings with pagination, filtering by status, and exact value search.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author V.Roopesh (ID: 252U1R1249)
 */
bookingRouter.get("/", async (req, res) => {
    try {
        const statusQuery = req.query.status;
        const searchQuery = req.query.search;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (statusQuery && ["Active", "Completed", "Cancelled"].includes(statusQuery)) {
            whereClause.status = statusQuery;
        }
        if (searchQuery) {
            const parsedSearch = parseInt(searchQuery);
            if (!isNaN(parsedSearch)) {
                whereClause.liveMeterAndBilling = parsedSearch;
            }
        }
        const [bookings, totalCount] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.chauffeurServiceHourlyBooking.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: "desc"
                },
                skip: skip,
                take: limit,
                include: {
                    customer: true,
                    vehicle: true
                }
            }),
            prisma_1.prisma.chauffeurServiceHourlyBooking.count({
                where: whereClause
            })
        ]);
        res.status(200).json({
            success: true,
            data: bookings,
            total_count: totalCount,
            page: page,
            limit: limit
        });
    }
    catch (error) {
        console.error("[GET /] Fetch bookings failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
/**
 * @route GET /api/chauffeur_service_hourly_booking/:id
 * @description Returns a single booking record by ID with UUID format safety checks.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author V.Roopesh (ID: 252U1R1249)
 */
bookingRouter.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const booking = await prisma_1.prisma.chauffeurServiceHourlyBooking.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true
            }
        });
        if (!booking) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        console.error("[GET /:id] Fetch single booking failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
/**
 * @route GET /api/chauffeur_service_hourly_booking/:id/detail
 * @description Fetches a complex joined booking record containing related customer, vehicle, and payment objects.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author V.Roopesh (ID: 252U1R1249)
 */
bookingRouter.get("/:id/detail", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const booking = await prisma_1.prisma.chauffeurServiceHourlyBooking.findUnique({
            where: { id },
            include: {
                customer: true,
                vehicle: true,
                payments: true
            }
        });
        if (!booking) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        console.error("[GET /:id/detail] Fetch joined booking failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
/**
 * @route GET /api/chauffeur_service_hourly_booking/:id/calculate
 * @description Calculates dynamic pricing invoices (surcharges, GST) based on active DB trip parameters.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author V.Roopesh (ID: 252U1R1249)
 */
bookingRouter.get("/:id/calculate", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const booking = await prisma_1.prisma.chauffeurServiceHourlyBooking.findUnique({
            where: { id },
            include: {
                vehicle: true
            }
        });
        if (!booking) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const calculations = (0, billingEngine_1.calculateBookingBill)(booking.id, booking.liveMeterAndBilling, booking.createdDate, booking.vehicle?.category || "Luxury SUV");
        res.status(200).json({
            success: true,
            data: calculations
        });
    }
    catch (error) {
        console.error("[GET /:id/calculate] Calculation failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
/**
 * @route PUT /api/chauffeur_service_hourly_booking/:id
 * @description Performs a full resource replacement of a booking record with Zod verification.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author V.Roopesh (ID: 252U1R1249)
 */
bookingRouter.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const existing = await prisma_1.prisma.chauffeurServiceHourlyBooking.findUnique({
            where: { id }
        });
        if (!existing) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const body = createBookingSchema.parse(req.body);
        const updatedBooking = await prisma_1.prisma.chauffeurServiceHourlyBooking.update({
            where: { id },
            data: {
                liveMeterAndBilling: Math.round(body.live_meter_and_billing),
                status: body.status,
                createdDate: new Date(body.created_date),
                notes: body.notes,
                updatedAt: new Date(),
            },
            include: {
                customer: true,
                vehicle: true
            }
        });
        console.log(`[PUT /:id] Booking ${id} updated successfully.`);
        res.status(200).json({
            success: true,
            message: "Booking record updated successfully.",
            data: updatedBooking
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
        console.error("[PUT /:id] Booking update failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
/**
 * @type {z.ZodObject} statusUpdateSchema
 * @description Zod schema validating lightweight status modifications.
 */
const statusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(["Active", "Completed", "Cancelled"])
});
/**
 * @route PATCH /api/chauffeur_service_hourly_booking/:id/status
 * @description Mutates only the status flag of a booking, registering transition logs.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author V.Roopesh (ID: 252U1R1249)
 */
bookingRouter.patch("/:id/status", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const existing = await prisma_1.prisma.chauffeurServiceHourlyBooking.findUnique({
            where: { id }
        });
        if (!existing) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Booking record not found with the provided ID."
            });
            return;
        }
        const body = statusUpdateSchema.parse(req.body);
        const oldStatus = existing.status;
        const updatedBooking = await prisma_1.prisma.chauffeurServiceHourlyBooking.update({
            where: { id },
            data: {
                status: body.status,
                updatedAt: new Date(),
            },
            include: {
                customer: true,
                vehicle: true
            }
        });
        console.log(`[Status Change] Booking ${id}: ${oldStatus} → ${body.status}`);
        res.status(200).json({
            success: true,
            message: `Status changed from ${oldStatus} to ${body.status}.`,
            data: updatedBooking
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
        console.error("[PATCH /:id/status] Status update failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
/**
 * @route POST /api/chauffeur_service_hourly_booking
 * @description Registers a new hourly booking. Automatically hooks up fallback customer and vehicle accounts if not specified.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author V.Roopesh (ID: 252U1R1249)
 */
bookingRouter.post("/", async (req, res) => {
    try {
        const body = createBookingSchema.parse(req.body);
        let customerId = body.customer_id;
        if (!customerId) {
            const defaultCustomer = await prisma_1.prisma.customer.upsert({
                where: { email: "roopesh@manivtha.com" },
                update: {},
                create: {
                    name: "V.Roopesh",
                    email: "roopesh@manivtha.com",
                    phone: "252U1R1249",
                }
            });
            customerId = defaultCustomer.id;
        }
        let vehicleId = body.vehicle_id;
        if (!vehicleId) {
            const defaultVehicle = await prisma_1.prisma.vehicle.upsert({
                where: { plateNumber: "AP-09-XX-1234" },
                update: {},
                create: {
                    make: "Toyota",
                    model: "Innova Crysta",
                    plateNumber: "AP-09-XX-1234",
                    category: "Luxury SUV"
                }
            });
            vehicleId = defaultVehicle.id;
        }
        const booking = await prisma_1.prisma.chauffeurServiceHourlyBooking.create({
            data: {
                customerId: customerId,
                vehicleId: vehicleId,
                liveMeterAndBilling: Math.round(body.live_meter_and_billing),
                status: body.status,
                createdDate: new Date(body.created_date),
                notes: body.notes,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
        res.status(201).json({
            success: true,
            message: "Booking entry created successfully.",
            data: booking
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
        console.error("[POST /] Booking creation failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
exports.default = bookingRouter;
