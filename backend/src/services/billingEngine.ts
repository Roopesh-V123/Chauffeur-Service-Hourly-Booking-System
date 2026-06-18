/**
 * @interface BillingCalculationResult
 * @description Structure of the billing engine's output calculations.
 * 
 * @author QA Reviewer (ID: MNVT-OP-9944)
 * @client Manivtha Tours & Travels
 */
export interface BillingCalculationResult {
  bookingId: string;
  vehicleCategory: string;
  baseRatePerHour: number;
  rawHours: number;
  billedHours: number;
  baseFare: number;
  isPeakHour: boolean;
  peakSurcharge: number;
  isNightTime: boolean;
  nightSurcharge: number;
  subtotal: number;
  gst: number;
  totalAmount: number;
}

/**
 * Calculates the complete bill breakdown based on trip duration and vehicle categories.
 * Handles minimum 4-hour thresholds, peak hours (+15%), night shifts (+20%), and GST taxes (18%).
 * 
 * @param {string} bookingId The ID reference of the booking record
 * @param {number} rawHours The duration hours recorded (mapped from liveMeterAndBilling)
 * @param {Date} createdDate The start date/time of the booking session
 * @param {string} vehicleCategory The category of the vehicle (Premium Sedan, Luxury SUV, Executive Van)
 * @returns {BillingCalculationResult} Object containing base rate, surcharges, subtotal, GST, and totalAmount
 * @author QA Reviewer (ID: MNVT-OP-9944)
 */
export function calculateBookingBill(
  bookingId: string,
  rawHours: number,
  createdDate: Date,
  vehicleCategory: string = "Luxury SUV"
): BillingCalculationResult {
  // 1. Validate hours input to prevent division-by-zero or negative ranges
  if (rawHours === null || rawHours === undefined || isNaN(rawHours)) {
    throw new Error("Duration hours must be a valid numeric parameter.");
  }
  if (rawHours < 0) {
    throw new Error("Duration hours cannot be a negative value.");
  }
  if (rawHours === 0) {
    throw new Error("Duration hours cannot be zero.");
  }

  // 2. Select base rate based on fleet category
  let baseRatePerHour = 1800; // Default to Luxury SUV rate
  const categoryLower = vehicleCategory.toLowerCase();
  
  if (categoryLower.includes("sedan")) {
    baseRatePerHour = 1200;
  } else if (categoryLower.includes("suv")) {
    baseRatePerHour = 1800;
  } else if (categoryLower.includes("van")) {
    baseRatePerHour = 2500;
  }

  // 3. Enforce the minimum 4-hour billing threshold
  const billedHours = Math.max(rawHours, 4);
  const baseFare = billedHours * baseRatePerHour;

  // 4. Calculate dynamic time-of-day surcharges
  // Peak Hour: 08:00 AM - 11:00 AM or 05:00 PM - 08:00 PM
  const startHour = createdDate.getHours();
  const isPeakHour = (startHour >= 8 && startHour < 11) || (startHour >= 17 && startHour < 20);
  const peakSurcharge = isPeakHour ? Math.round(baseFare * 0.15) : 0;

  // Night Time: 10:00 PM - 06:00 AM
  const isNightTime = (startHour >= 22 || startHour < 6);
  const nightSurcharge = isNightTime ? Math.round(baseFare * 0.20) : 0;

  // 5. Aggregate intermediate values and taxes (18% GST)
  const subtotal = baseFare + peakSurcharge + nightSurcharge;
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const totalAmount = Math.round((subtotal + gst) * 100) / 100;

  return {
    bookingId,
    vehicleCategory,
    baseRatePerHour,
    rawHours,
    billedHours,
    baseFare,
    isPeakHour,
    peakSurcharge,
    isNightTime,
    nightSurcharge,
    subtotal,
    gst,
    totalAmount
  };
}
