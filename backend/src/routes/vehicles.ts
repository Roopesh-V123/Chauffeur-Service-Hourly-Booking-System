import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { z } from "zod";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Complete CRUD router for Vehicle entity
const vehiclesRouter = Router();

const vehicleSchema = z.object({
  make: z.string().min(1, "Make cannot be empty"),
  model: z.string().min(1, "Model cannot be empty"),
  plate_number: z.string().min(1, "Plate number cannot be empty"),
  category: z.string().min(1, "Category cannot be empty"),
});

/**
 * GET /api/vehicles
 * Lists all vehicles with category filtering, optional search filtering, and pagination.
 */
vehiclesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.search as string;
    const categoryQuery = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (categoryQuery) {
      whereClause.category = categoryQuery;
    }

    if (searchQuery) {
      whereClause.OR = [
        { make: { contains: searchQuery, mode: "insensitive" } },
        { model: { contains: searchQuery, mode: "insensitive" } },
        { plateNumber: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const [vehicles, totalCount] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where: whereClause,
        orderBy: { make: "asc" },
        skip: skip,
        take: limit,
      }),
      prisma.vehicle.count({
        where: whereClause,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: vehicles,
      total_count: totalCount,
      page: page,
      limit: limit,
    });
  } catch (error: any) {
    console.error("[GET /api/vehicles] Fetch vehicles failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * GET /api/vehicles/:id
 * Fetches a single vehicle by ID with linked bookings.
 */
vehiclesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vehicle record not found with the provided ID.",
      });
      return;
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vehicle record not found with the provided ID.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error: any) {
    console.error("[GET /api/vehicles/:id] Fetch vehicle failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * POST /api/vehicles
 * Registers a new vehicle.
 */
vehiclesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const body = vehicleSchema.parse(req.body);

    const plateExists = await prisma.vehicle.findUnique({
      where: { plateNumber: body.plate_number },
    });

    if (plateExists) {
      res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "A vehicle with this license plate number already exists.",
      });
      return;
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        make: body.make,
        model: body.model,
        plateNumber: body.plate_number,
        category: body.category,
      },
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      data: vehicle,
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
    console.error("[POST /api/vehicles] Vehicle creation failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * PUT /api/vehicles/:id
 * Updates an existing vehicle's details.
 */
vehiclesRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vehicle record not found with the provided ID.",
      });
      return;
    }

    const existing = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vehicle record not found with the provided ID.",
      });
      return;
    }

    const body = vehicleSchema.parse(req.body);

    // If plate changes, check uniqueness
    if (body.plate_number !== existing.plateNumber) {
      const plateExists = await prisma.vehicle.findUnique({
        where: { plateNumber: body.plate_number },
      });

      if (plateExists) {
        res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "A vehicle with this license plate number already exists.",
        });
        return;
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        make: body.make,
        model: body.model,
        plateNumber: body.plate_number,
        category: body.category,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Vehicle record updated successfully.",
      data: updatedVehicle,
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
    console.error("[PUT /api/vehicles/:id] Vehicle update failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * DELETE /api/vehicles/:id
 * Deletes a vehicle record.
 */
vehiclesRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vehicle record not found with the provided ID.",
      });
      return;
    }

    const existing = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vehicle record not found with the provided ID.",
      });
      return;
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Vehicle record deleted successfully.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/vehicles/:id] Vehicle deletion failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default vehiclesRouter;
