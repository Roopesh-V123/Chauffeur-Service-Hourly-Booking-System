"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const zod_1 = require("zod");
// Author: QA Reviewer (ID: MNVT-OP-9944)
// Complete CRUD router for Vehicle entity
const vehiclesRouter = (0, express_1.Router)();
const vehicleSchema = zod_1.z.object({
    make: zod_1.z.string().min(1, "Make cannot be empty"),
    model: zod_1.z.string().min(1, "Model cannot be empty"),
    plate_number: zod_1.z.string().min(1, "Plate number cannot be empty"),
    category: zod_1.z.string().min(1, "Category cannot be empty"),
});
/**
 * GET /api/vehicles
 * Lists all vehicles with category filtering, optional search filtering, and pagination.
 */
vehiclesRouter.get("/", async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const categoryQuery = req.query.category;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const whereClause = {};
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
        const [vehicles, totalCount] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.vehicle.findMany({
                where: whereClause,
                orderBy: { make: "asc" },
                skip: skip,
                take: limit,
            }),
            prisma_1.prisma.vehicle.count({
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
    }
    catch (error) {
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
vehiclesRouter.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Vehicle record not found with the provided ID.",
            });
            return;
        }
        const vehicle = await prisma_1.prisma.vehicle.findUnique({
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
    }
    catch (error) {
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
vehiclesRouter.post("/", async (req, res) => {
    try {
        const body = vehicleSchema.parse(req.body);
        const plateExists = await prisma_1.prisma.vehicle.findUnique({
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
        const vehicle = await prisma_1.prisma.vehicle.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
vehiclesRouter.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Vehicle record not found with the provided ID.",
            });
            return;
        }
        const existing = await prisma_1.prisma.vehicle.findUnique({
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
            const plateExists = await prisma_1.prisma.vehicle.findUnique({
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
        const updatedVehicle = await prisma_1.prisma.vehicle.update({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
vehiclesRouter.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            res.status(404).json({
                success: false,
                error: "Not Found",
                message: "Vehicle record not found with the provided ID.",
            });
            return;
        }
        const existing = await prisma_1.prisma.vehicle.findUnique({
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
        await prisma_1.prisma.vehicle.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "Vehicle record deleted successfully.",
        });
    }
    catch (error) {
        console.error("[DELETE /api/vehicles/:id] Vehicle deletion failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message,
        });
    }
});
exports.default = vehiclesRouter;
