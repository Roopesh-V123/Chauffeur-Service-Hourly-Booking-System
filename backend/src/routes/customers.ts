import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { z } from "zod";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Complete CRUD router for Customer entity
const customersRouter = Router();

const customerSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number cannot be empty"),
});

/**
 * GET /api/customers
 * Lists all customers with optional search filtering and pagination.
 */
customersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
        { phone: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const [customers, totalCount] = await prisma.$transaction([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
        skip: skip,
        take: limit,
      }),
      prisma.customer.count({
        where: whereClause,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      total_count: totalCount,
      page: page,
      limit: limit,
    });
  } catch (error: any) {
    console.error("[GET /api/customers] Fetch customers failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * GET /api/customers/:id
 * Fetches a single customer by ID with linked bookings.
 */
customersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Customer record not found with the provided ID.",
      });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Customer record not found with the provided ID.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error("[GET /api/customers/:id] Fetch customer failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * POST /api/customers
 * Registers a new customer.
 */
customersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const body = customerSchema.parse(req.body);

    const emailExists = await prisma.customer.findUnique({
      where: { email: body.email },
    });

    if (emailExists) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "A customer with this email address already exists.",
      });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      data: customer,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation Error",
        details: error.flatten().fieldErrors,
      });
      return;
    }
    console.error("[POST /api/customers] Customer creation failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * PUT /api/customers/:id
 * Updates an existing customer's information.
 */
customersRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Customer record not found with the provided ID.",
      });
      return;
    }

    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Customer record not found with the provided ID.",
      });
      return;
    }

    const body = customerSchema.parse(req.body);

    // If email changes, check uniqueness
    if (body.email !== existing.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "A customer with this email address already exists.",
        });
        return;
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Customer record updated successfully.",
      data: updatedCustomer,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation Error",
        details: error.flatten().fieldErrors,
      });
      return;
    }
    console.error("[PUT /api/customers/:id] Customer update failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * DELETE /api/customers/:id
 * Deletes a customer.
 */
customersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Customer record not found with the provided ID.",
      });
      return;
    }

    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Customer record not found with the provided ID.",
      });
      return;
    }

    await prisma.customer.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Customer record deleted successfully.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/customers/:id] Customer deletion failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default customersRouter;
