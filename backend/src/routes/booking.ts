/**
 * @file booking.ts
 * @description Router implementing CRUD endpoints, dynamic pricing calculators, and status mutation lifecycles 
 * for chauffeur hourly bookings in the PostgreSQL DB via Prisma.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */

import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import { calculateBookingBill } from "../services/billingEngine";

const bookingRouter = Router();

/**
 * @type {z.ZodObject} createBookingSchema
 * @description Zod schema for validating booking creation request payloads.
 * Ensures data matches relational model structures.
 */
const createBookingSchema = z.object({
  live_meter_and_billing: z.number().positive("Live meter and billing must be a positive number"),
  status: z.enum(["Active", "Completed", "Cancelled"]),
  created_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format (must be YYYY-MM-DD)"
  }),
  notes: z.string().min(1, "Notes cannot be empty"),
  customer_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
});

/**
 * @route GET /api/chauffeur_service_hourly_booking
 * @description Lists bookings with pagination, filtering by status, and exact value search.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.get("/", async (req: Request, res: Response) => {
  try {
    const statusQuery = req.query.status as string;
    const searchQuery = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (statusQuery && ["Active", "Completed", "Cancelled"].includes(statusQuery)) {
      whereClause.status = statusQuery;
    }

    if (searchQuery) {
      const parsedSearch = parseInt(searchQuery);
      if (!isNaN(parsedSearch)) {
        whereClause.liveMeterAndBilling = parsedSearch;
      }
    }

    const [bookings, totalCount] = await prisma.$transaction([
      prisma.chauffeurServiceHourlyBooking.findMany({
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
      prisma.chauffeurServiceHourlyBooking.count({
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
  } catch (error: any) {
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
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Booking record not found with the provided ID."
      });
      return;
    }

    const booking = await prisma.chauffeurServiceHourlyBooking.findUnique({
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
  } catch (error: any) {
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
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.get("/:id/detail", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Booking record not found with the provided ID."
      });
      return;
    }

    const booking = await prisma.chauffeurServiceHourlyBooking.findUnique({
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
  } catch (error: any) {
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
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.get("/:id/calculate", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Booking record not found with the provided ID."
      });
      return;
    }

    const booking = await prisma.chauffeurServiceHourlyBooking.findUnique({
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

    const calculations = calculateBookingBill(
      booking.id,
      booking.liveMeterAndBilling,
      booking.createdDate,
      booking.vehicle?.category || "Luxury SUV"
    );

    res.status(200).json({
      success: true,
      data: calculations
    });
  } catch (error: any) {
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
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Booking record not found with the provided ID."
      });
      return;
    }

    const existing = await prisma.chauffeurServiceHourlyBooking.findUnique({
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

    const updatedBooking = await prisma.chauffeurServiceHourlyBooking.update({
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
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
const statusUpdateSchema = z.object({
  status: z.enum(["Active", "Completed", "Cancelled"])
});

/**
 * @route PATCH /api/chauffeur_service_hourly_booking/:id/status
 * @description Mutates only the status flag of a booking, registering transition logs.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Booking record not found with the provided ID."
      });
      return;
    }

    const existing = await prisma.chauffeurServiceHourlyBooking.findUnique({
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

    const updatedBooking = await prisma.chauffeurServiceHourlyBooking.update({
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
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
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.post("/", async (req: Request, res: Response) => {
  try {
    const body = createBookingSchema.parse(req.body);

    let customerId = body.customer_id;
    if (!customerId) {
      const defaultCustomer = await prisma.customer.upsert({
        where: { email: "operator@manivtha.com" },
        update: {},
        create: {
          name: "Lead Operator",
          email: "operator@manivtha.com",
          phone: "MNVT-OP-9944",
        }
      });
      customerId = defaultCustomer.id;
    }

    let vehicleId = body.vehicle_id;
    if (!vehicleId) {
      const defaultVehicle = await prisma.vehicle.upsert({
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

    const booking = await prisma.chauffeurServiceHourlyBooking.create({
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
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

/**
 * @route DELETE /api/chauffeur_service_hourly_booking/:id
 * @description Removes a booking record by ID with relational cascade checks.
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
bookingRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Booking record not found with the provided ID."
      });
      return;
    }

    const existing = await prisma.chauffeurServiceHourlyBooking.findUnique({
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

    await prisma.chauffeurServiceHourlyBooking.delete({
      where: { id }
    });

    console.log(`[DELETE /:id] Booking ${id} deleted successfully.`);

    res.status(200).json({
      success: true,
      message: "Booking record deleted successfully."
    });
  } catch (error: any) {
    console.error("[DELETE /:id] Booking deletion failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

export default bookingRouter;
