"use strict";
/**
 * @file prisma.ts
 * @description Exposes a singleton instance of the PrismaClient.
 * This ensures that a single database connection pool is shared across all Express modules,
 * preventing connection leakage on PostgreSQL servers during concurrent query activities.
 *
 * @author V.Roopesh (ID: 252U1R1249)
 * @client Manivtha Tours & Travels
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
