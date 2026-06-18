import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 19: Full Integration + Alerts/Notifications API
const dashboardRouter = Router();

/**
 * GET /api/dashboard/summary
 * Returns top-level summary metrics (active bookings, pending payments) and system notifications.
 */
dashboardRouter.get("/summary", async (req: Request, res: Response) => {
  try {
    // 1. Fetch counts from database in a single transaction
    const [activeBookingsCount, pendingPaymentsCount, pendingPaymentsSum] = await prisma.$transaction([
      prisma.chauffeurServiceHourlyBooking.count({
        where: { status: "Active" }
      }),
      prisma.payment.count({
        where: { status: "Pending" }
      }),
      prisma.payment.aggregate({
        where: { status: "Pending" },
        _sum: { amount: true }
      })
    ]);

    // 2. Fetch completed bookings with pending/no payments to trigger dynamic alerts
    const completedBookings = await prisma.chauffeurServiceHourlyBooking.findMany({
      where: { status: "Completed" },
      include: {
        customer: true,
        payments: true
      }
    });

    const alerts: Array<{ id: string; message: string; type: "warning" | "info"; timestamp: string }> = [];

    // Alert Rule A: Completed bookings with outstanding payment status
    completedBookings.forEach((b) => {
      const hasPaid = b.payments.some((p) => p.status === "Paid");
      if (!hasPaid) {
        alerts.push({
          id: `alert-payment-${b.id}`,
          message: `Booking Completed but Payment Pending for passenger ${b.customer?.name || "Customer"}.`,
          type: "warning",
          timestamp: new Date().toISOString()
        });
      }
    });

    // Alert Rule B: Active bookings with high durations (>= 8 hours)
    const highDurationBookings = await prisma.chauffeurServiceHourlyBooking.findMany({
      where: {
        status: "Active",
        liveMeterAndBilling: { gte: 8 }
      },
      include: {
        customer: true
      }
    });

    highDurationBookings.forEach((b) => {
      alerts.push({
        id: `alert-duration-${b.id}`,
        message: `High-duration Active booking for ${b.customer?.name || "Customer"} (${b.liveMeterAndBilling} hrs).`,
        type: "info",
        timestamp: new Date().toISOString()
      });
    });

    // Standard Info Alert if system is up
    if (alerts.length === 0) {
      alerts.push({
        id: "alert-system-ok",
        message: "All chauffeur assignments and payments are balanced. No outstanding alerts.",
        type: "info",
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: {
        active_bookings_count: activeBookingsCount,
        pending_payments_count: pendingPaymentsCount,
        pending_payments_amount: Number(pendingPaymentsSum._sum?.amount || 0),
        alerts: alerts
      }
    });
  } catch (error: any) {
    console.error("[GET /api/dashboard/summary] Fetch summary metrics failed:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

export default dashboardRouter;
