import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { z } from "zod";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Route definitions for payment CRUD operations linked to chauffeur bookings
const paymentRouter = Router();

// Zod schema for payment creation
const createPaymentSchema = z.object({
  booking_id: z.string().uuid("Booking ID must be a valid UUID"),
  amount: z.number().positive("Payment amount must be a positive number"),
  method: z.enum(["Cash", "Card", "UPI", "BankTransfer"]),
  transaction_reference: z.string().min(3, "Transaction reference must be at least 3 characters").optional(),
});

/**
 * GET /api/payments
 * Lists all payment records with pagination and optional filtering by status and method.
 * Includes related booking data for cross-reference.
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
paymentRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const statusQuery = req.query.status as string | undefined;
    const methodQuery = req.query.method as string | undefined;

    const whereClause: any = {};

    // Filter by payment status if provided
    if (statusQuery && ["Pending", "Paid", "Failed"].includes(statusQuery)) {
      whereClause.status = statusQuery;
    }

    // Filter by payment method if provided
    if (methodQuery && ["Cash", "Card", "UPI", "BankTransfer"].includes(methodQuery)) {
      whereClause.method = methodQuery;
    }

    const [payments, totalCount] = await prisma.$transaction([
      prisma.payment.findMany({
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
      prisma.payment.count({
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
  } catch (error: any) {
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
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
paymentRouter.post("/", async (req: Request, res: Response) => {
  try {
    const body = createPaymentSchema.parse(req.body);

    // Verify the referenced booking exists
    const bookingExists = await prisma.chauffeurServiceHourlyBooking.findUnique({
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

    const payment = await prisma.payment.create({
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
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

/**
 * GET /api/payments/:id
 * Fetches a single payment record by ID.
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
paymentRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Payment record not found with the provided ID."
      });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: true
      }
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Payment record not found with the provided ID."
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    console.error("[GET /api/payments/:id] Fetch payment failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

const updatePaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be a positive number").optional(),
  status: z.enum(["Pending", "Paid", "Failed"]).optional(),
  transaction_reference: z.string().min(3).optional().nullable(),
});

/**
 * PUT /api/payments/:id
 * Updates an existing payment record.
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
paymentRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Payment record not found with the provided ID."
      });
      return;
    }

    const existing = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Payment record not found with the provided ID."
      });
      return;
    }

    const body = updatePaymentSchema.parse(req.body);

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: body.amount !== undefined ? body.amount : existing.amount,
        status: body.status !== undefined ? body.status : existing.status,
        transactionReference: body.transaction_reference !== undefined ? body.transaction_reference : existing.transactionReference,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: "Payment record updated successfully.",
      data: updatedPayment
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
    console.error("[PUT /api/payments/:id] Payment update failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

/**
 * DELETE /api/payments/:id
 * Deletes an existing payment record.
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
paymentRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Payment record not found with the provided ID."
      });
      return;
    }

    const existing = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Payment record not found with the provided ID."
      });
      return;
    }

    await prisma.payment.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Payment record deleted successfully."
    });
  } catch (error: any) {
    console.error("[DELETE /api/payments/:id] Payment deletion failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

export default paymentRouter;
