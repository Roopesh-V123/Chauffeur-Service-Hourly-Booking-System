"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const billingEngine_1 = require("../services/billingEngine");
// Author: V.Roopesh (ID: 252U1R1249)
// Day 18: REVIEW PRESENTATION 2 — Day 2 + Reports & Analytics API
const reportsRouter = (0, express_1.Router)();
/**
 * GET /api/reports/summary
 * Returns overall counts grouped by booking status, total metrics (revenue and hours),
 * and a 30-day time series data array for charts.
 */
reportsRouter.get("/summary", async (req, res) => {
    try {
        const fromStr = req.query.from;
        const toStr = req.query.to;
        const whereClause = {};
        if (fromStr || toStr) {
            whereClause.createdDate = {};
            if (fromStr) {
                whereClause.createdDate.gte = new Date(fromStr);
            }
            if (toStr) {
                whereClause.createdDate.lte = new Date(toStr);
            }
        }
        // Fetch all bookings matching filter
        const bookings = await prisma_1.prisma.chauffeurServiceHourlyBooking.findMany({
            where: whereClause,
            include: {
                vehicle: true,
                payments: true
            },
            orderBy: {
                createdDate: "asc"
            }
        });
        // 1. Group counts by status
        const statusCounts = {
            Active: 0,
            Completed: 0,
            Cancelled: 0
        };
        let totalHours = 0;
        let totalRevenue = 0;
        // Sum paid payments
        const payments = await prisma_1.prisma.payment.findMany({
            where: {
                status: "Paid",
                createdAt: fromStr || toStr ? {
                    gte: fromStr ? new Date(fromStr) : undefined,
                    lte: toStr ? new Date(toStr) : undefined
                } : undefined
            }
        });
        const totalPaidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        let calculatedRevenueTotal = 0;
        bookings.forEach((booking) => {
            // Group status counts
            if (booking.status in statusCounts) {
                statusCounts[booking.status]++;
            }
            // Sum raw hours
            totalHours += booking.liveMeterAndBilling;
            // Sum billing calculations
            try {
                const bill = (0, billingEngine_1.calculateBookingBill)(booking.id, booking.liveMeterAndBilling, booking.createdDate, booking.vehicle?.category || "Luxury SUV");
                calculatedRevenueTotal += bill.totalAmount;
            }
            catch (err) {
                // Ignore calculations failure
            }
        });
        totalRevenue = totalPaidAmount > 0 ? totalPaidAmount : calculatedRevenueTotal;
        // 2. Generate 30-day (or specified range) time series
        // If no range is specified, default to the last 30 days
        let startDate = new Date();
        let endDate = new Date();
        if (fromStr) {
            startDate = new Date(fromStr);
        }
        else {
            startDate.setDate(startDate.getDate() - 29); // 30 days including today
        }
        if (toStr) {
            endDate = new Date(toStr);
        }
        const timeSeriesMap = {};
        const tempDate = new Date(startDate);
        tempDate.setHours(0, 0, 0, 0);
        const stopDate = new Date(endDate);
        stopDate.setHours(0, 0, 0, 0);
        // Initialize the range
        while (tempDate <= stopDate) {
            const key = tempDate.toISOString().split("T")[0];
            timeSeriesMap[key] = { bookings: 0, revenue: 0, hours: 0 };
            tempDate.setDate(tempDate.getDate() + 1);
        }
        // Populate data
        bookings.forEach((booking) => {
            const dateKey = new Date(booking.createdDate).toISOString().split("T")[0];
            if (timeSeriesMap[dateKey]) {
                timeSeriesMap[dateKey].bookings += 1;
                timeSeriesMap[dateKey].hours += booking.liveMeterAndBilling;
                // Add payment amount if exists, else add calculated billing
                const paidAmount = booking.payments
                    .filter((p) => p.status === "Paid")
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                if (paidAmount > 0) {
                    timeSeriesMap[dateKey].revenue += paidAmount;
                }
                else {
                    try {
                        const bill = (0, billingEngine_1.calculateBookingBill)(booking.id, booking.liveMeterAndBilling, booking.createdDate, booking.vehicle?.category || "Luxury SUV");
                        timeSeriesMap[dateKey].revenue += bill.totalAmount;
                    }
                    catch {
                        // Ignore calculations failure
                    }
                }
            }
        });
        const timeSeries = Object.entries(timeSeriesMap).map(([date, data]) => ({
            date,
            bookings: data.bookings,
            revenue: Math.round(data.revenue * 100) / 100,
            hours: data.hours
        }));
        res.status(200).json({
            success: true,
            data: {
                status_breakdown: statusCounts,
                total_bookings: bookings.length,
                total_revenue: Math.round(totalRevenue * 100) / 100,
                total_hours: totalHours,
                time_series: timeSeries,
                bookings: bookings
            }
        });
    }
    catch (error) {
        console.error("[GET /api/reports/summary] Fetch summary analytics failed:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error.message
        });
    }
});
exports.default = reportsRouter;
