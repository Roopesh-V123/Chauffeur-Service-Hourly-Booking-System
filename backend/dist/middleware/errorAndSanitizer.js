"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
exports.globalErrorHandler = globalErrorHandler;
exports.sanitizeInput = sanitizeInput;
// Author: V.Roopesh (ID: 252U1R1249)
// Day 21: Backend Try-Catch Enforcement, Sanitization & Unified Error Response
/**
 * Async handler wrapper to enforce try-catch behavior on every Express endpoint,
 * preventing unhandled promise rejections.
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Standardized global error handling middleware for Express.
 * Formats all exceptions to: {"success": false, "message": "...", "code": 400/404/500}
 */
function globalErrorHandler(err, req, res, next) {
    console.error("[Global Error Handler]:", err);
    let statusCode = 500;
    let message = "An unexpected internal server error occurred.";
    // Handle specific Zod validation failures as 400
    if (err.name === "ZodError" || err.flatten) {
        statusCode = 400;
        message = "Request validation failed. Please review input parameters.";
    }
    else if (err.status || err.statusCode) {
        statusCode = err.status || err.statusCode;
        message = err.message || message;
    }
    else {
        message = err.message || message;
    }
    res.status(statusCode).json({
        success: false,
        message: message,
        code: statusCode
    });
}
/**
 * Input sanitization middleware.
 * Strips HTML tags and excessive symbols from incoming POST/PUT text parameters
 * to protect database storage.
 */
function sanitizeInput(req, res, next) {
    if (req.body && typeof req.body === "object") {
        for (const key in req.body) {
            if (typeof req.body[key] === "string") {
                // Strip HTML tags using Regex sanitization, preventing cross-script issues
                req.body[key] = req.body[key]
                    .replace(/<[^>]*>/g, "")
                    .trim();
            }
        }
    }
    next();
}
