/**
 * @file prisma.ts
 * @description Exposes a singleton instance of the PrismaClient.
 * This ensures that a single database connection pool is shared across all Express modules,
 * preventing connection leakage on PostgreSQL servers during concurrent query activities.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
