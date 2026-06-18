import { PrismaClient } from "@prisma/client";
import process from "process";

// Author: QA Reviewer (ID: MNVT-OP-9944)
// Day 20: 15-Record Seeding Script for Data Consistency Testing
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clear all existing database records to prevent constraint errors
  await prisma.payment.deleteMany({});
  await prisma.chauffeurServiceHourlyBooking.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.vehicle.deleteMany({});

  // 1. Create Default Customers
  const customer1 = await prisma.customer.upsert({
    where: { email: "operator@manivtha.com" },
    update: {},
    create: {
      id: "772f1228-5690-4221-a1e6-b9b9409890a1",
      name: "Lead Operator",
      email: "operator@manivtha.com",
      phone: "MNVT-OP-9944"
    }
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: "corporate@microsoft.com" },
    update: {},
    create: {
      id: "3e58fb63-7eb6-4c4f-9e7f-b0f37c3558d1",
      name: "Microsoft India",
      email: "corporate@microsoft.com",
      phone: "+91 80 6677 8000"
    }
  });

  const customer3 = await prisma.customer.upsert({
    where: { email: "tourist.walkin@manivtha.com" },
    update: {},
    create: {
      id: "9218fb63-7eb6-4c4f-9e7f-b0f37c3558d3",
      name: "Standard Tourist Walk-In",
      email: "tourist.walkin@manivtha.com",
      phone: "N/A"
    }
  });

  // 2. Create Default Vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: "AP-09-XX-1234" },
    update: {},
    create: {
      id: "2d17c918-a6d1-443b-bd98-7cfa8c9590b1",
      make: "Toyota",
      model: "Innova Crysta",
      plateNumber: "AP-09-XX-1234",
      category: "Luxury SUV"
    }
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: "TS-09-YY-9999" },
    update: {},
    create: {
      id: "9c17c918-a6d1-443b-bd98-7cfa8c9590b2",
      make: "BMW",
      model: "5 Series",
      plateNumber: "TS-09-YY-9999",
      category: "Premium Sedan"
    }
  });

  const vehicle3 = await prisma.vehicle.upsert({
    where: { plateNumber: "KA-03-ZZ-8888" },
    update: {},
    create: {
      id: "ec17c918-a6d1-443b-bd98-7cfa8c9590b3",
      make: "Mercedes",
      model: "V-Class",
      plateNumber: "KA-03-ZZ-8888",
      category: "Executive Van"
    }
  });
  // 3. Define 15 realistic test bookings
  const bookingsData = [
    // 5 Completed
    {
      id: "c8e390c2-eb26-4d1a-9860-2646c24be0a1",
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      liveMeterAndBilling: 6, // 6 hours
      status: "Completed" as const,
      createdDate: new Date("2026-06-01"),
      notes: "Airport pick up for VIP QA Reviewer (ID: MNVT-OP-9944)",
      payment: { amount: 12744.00, status: "Paid" as const, ref: "TXN-001" }
    },
    {
      id: "d9e390c2-eb26-4d1a-9860-2646c24be0a2",
      customerId: customer2.id,
      vehicleId: vehicle2.id,
      liveMeterAndBilling: 4, // 4 hours minimum sedan check
      status: "Completed" as const,
      createdDate: new Date("2026-06-02"),
      notes: "Business trip for Microsoft executives.",
      payment: { amount: 5664.00, status: "Paid" as const, ref: "TXN-002" }
    },
    {
      id: "e9e390c2-eb26-4d1a-9860-2646c24be0a3",
      customerId: customer3.id,
      vehicleId: vehicle3.id,
      liveMeterAndBilling: 5, // 5 hours Van check
      status: "Completed" as const,
      createdDate: new Date("2026-06-03"),
      notes: "Sightseeing route, executive van service.",
      payment: { amount: 14750.00, status: "Paid" as const, ref: "TXN-003" }
    },
    {
      id: "f9e390c2-eb26-4d1a-9860-2646c24be0a4",
      customerId: customer1.id,
      vehicleId: vehicle2.id,
      liveMeterAndBilling: 8, // 8 hours sedan check
      status: "Completed" as const,
      createdDate: new Date("2026-06-04"),
      notes: "VIP guest day ride.",
      payment: { amount: 11328.00, status: "Paid" as const, ref: "TXN-004" }
    },
    {
      id: "a9e390c2-eb26-4d1a-9860-2646c24be0a5",
      customerId: customer2.id,
      vehicleId: vehicle1.id,
      liveMeterAndBilling: 12, // 12 hours SUV check
      status: "Completed" as const,
      createdDate: new Date("2026-06-05"),
      notes: "Outstation site visit for project leads.",
      payment: { amount: 25488.00, status: "Paid" as const, ref: "TXN-005" }
    },
    
    // 5 Active
    {
      id: "b9e390c2-eb26-4d1a-9860-2646c24be0a6",
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      liveMeterAndBilling: 9, // 9 hours active (triggers high-duration alert)
      status: "Active" as const,
      createdDate: new Date("2026-06-09"),
      notes: "Ongoing VIP trip with QA Reviewer (ID: MNVT-OP-9944)",
      payment: null
    },
    {
      id: "c9e390c2-eb26-4d1a-9860-2646c24be0a7",
      customerId: customer2.id,
      vehicleId: vehicle2.id,
      liveMeterAndBilling: 3, // 3 hours active
      status: "Active" as const,
      createdDate: new Date("2026-06-09"),
      notes: "Microsoft tech corridor transport.",
      payment: null
    },
    {
      id: "d9e390c2-eb26-4d1a-9860-2646c24be0a8",
      customerId: customer3.id,
      vehicleId: vehicle3.id,
      liveMeterAndBilling: 5, // 5 hours active
      status: "Active" as const,
      createdDate: new Date("2026-06-09"),
      notes: "Walk-in city tour assignment.",
      payment: null
    },
    {
      id: "e9e390c2-eb26-4d1a-9860-2646c24be0a9",
      customerId: customer1.id,
      vehicleId: vehicle3.id,
      liveMeterAndBilling: 4, // 4 hours active
      status: "Active" as const,
      createdDate: new Date("2026-06-09"),
      notes: "Family tour assignment.",
      payment: null
    },
    {
      id: "f9e390c2-eb26-4d1a-9860-2646c24be0a0",
      customerId: customer2.id,
      vehicleId: vehicle1.id,
      liveMeterAndBilling: 7, // 7 hours active
      status: "Active" as const,
      createdDate: new Date("2026-06-09"),
      notes: "Corporate executive dispatch.",
      payment: null
    },

    // 5 Cancelled
    {
      id: "a1e390c2-eb26-4d1a-9860-2646c24be0a1",
      customerId: customer3.id,
      vehicleId: vehicle1.id,
      liveMeterAndBilling: 4,
      status: "Cancelled" as const,
      createdDate: new Date("2026-06-05"),
      notes: "Client flight cancelled.",
      payment: null
    },
    {
      id: "a2e390c2-eb26-4d1a-9860-2646c24be0a2",
      customerId: customer1.id,
      vehicleId: vehicle2.id,
      liveMeterAndBilling: 5,
      status: "Cancelled" as const,
      createdDate: new Date("2026-06-06"),
      notes: "Schedule conflict for Lead Operator.",
      payment: null
    },
    {
      id: "a3e390c2-eb26-4d1a-9860-2646c24be0a3",
      customerId: customer2.id,
      vehicleId: vehicle3.id,
      liveMeterAndBilling: 8,
      status: "Cancelled" as const,
      createdDate: new Date("2026-06-07"),
      notes: "Meeting postponed.",
      payment: null
    },
    {
      id: "a4e390c2-eb26-4d1a-9860-2646c24be0a4",
      customerId: customer3.id,
      vehicleId: vehicle1.id,
      liveMeterAndBilling: 6,
      status: "Cancelled" as const,
      createdDate: new Date("2026-06-08"),
      notes: "Weather conditions delay.",
      payment: null
    },
    {
      id: "a5e390c2-eb26-4d1a-9860-2646c24be0a5",
      customerId: customer1.id,
      vehicleId: vehicle3.id,
      liveMeterAndBilling: 4,
      status: "Cancelled" as const,
      createdDate: new Date("2026-06-09"),
      notes: "Alternative transport arranged.",
      payment: null
    }
  ];

  for (const b of bookingsData) {
    const booking = await prisma.chauffeurServiceHourlyBooking.create({
      data: {
        id: b.id,
        customerId: b.customerId,
        vehicleId: b.vehicleId,
        liveMeterAndBilling: b.liveMeterAndBilling,
        status: b.status,
        createdDate: b.createdDate,
        notes: b.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    if (b.payment) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: b.payment.amount,
          status: b.payment.status,
          transactionReference: b.payment.ref,
          createdAt: new Date()
        }
      });
    }
  }

  console.log("Seeding complete. Created 3 customers, 3 vehicles, 15 bookings (5 Completed, 5 Active, 5 Cancelled) and 5 matching payments.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
