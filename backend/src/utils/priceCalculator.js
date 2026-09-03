/**
 * Server-Side Authoritative Helper functions for calculating package pricing,
 * guest counts, taxes, and discounts to prevent client-side price tampering.
 */

/**
 * Calculate total guests from room breakdown
 * @param {{ double?: number, triple?: number, quad?: number }} rooms
 * @returns {number}
 */
export const calculateTotalGuests = (rooms = {}) => {
  const doubleGuests = (Number(rooms.double) || 0) * 2;
  const tripleGuests = (Number(rooms.triple) || 0) * 3;
  const quadGuests = (Number(rooms.quad) || 0) * 4;
  const total = doubleGuests + tripleGuests + quadGuests;
  return total > 0 ? total : 1;
};

/**
 * Calculate authoritative financial breakdown from Package Object and Rooms
 * @param {object} pkg - Authoritative package retrieved from database
 * @param {object|null} rooms - Room selection { double, triple, quad }
 * @param {number} guestCount - Guest count fallback
 * @param {string} promoCode - Promo code (validated on server)
 * @param {number} taxPercent - GST percentage (default 5%)
 */
export const calculatePackageFinancials = (
  pkg,
  rooms = null,
  guestCount = 1,
  promoCode = "",
  taxPercent = 5
) => {
  const doublePrice = Number(pkg.pricing?.double || pkg.price || 19999);
  const triplePrice = Number(
    pkg.pricing?.triple || Math.round(doublePrice * 0.9)
  );
  const quadPrice = Number(pkg.pricing?.quad || Math.round(doublePrice * 0.8));

  let grossSubtotal = 0;
  let totalGuestsCount = 0;

  if (
    rooms &&
    (Number(rooms.double) > 0 ||
      Number(rooms.triple) > 0 ||
      Number(rooms.quad) > 0)
  ) {
    const doubleTotal = (Number(rooms.double) || 0) * 2 * doublePrice;
    const tripleTotal = (Number(rooms.triple) || 0) * 3 * triplePrice;
    const quadTotal = (Number(rooms.quad) || 0) * 4 * quadPrice;
    grossSubtotal = doubleTotal + tripleTotal + quadTotal;
    totalGuestsCount =
      (Number(rooms.double) || 0) * 2 +
      (Number(rooms.triple) || 0) * 3 +
      (Number(rooms.quad) || 0) * 4;
  } else {
    totalGuestsCount = Math.max(1, Number(guestCount) || 1);
    grossSubtotal = totalGuestsCount * doublePrice;
  }

  // Server-side promo code validation
  let discountPercent = 0;
  if (promoCode && typeof promoCode === "string") {
    const cleanPromo = promoCode.trim().toUpperCase();
    if (cleanPromo === "ROYAL15" || cleanPromo === "ROYALTY15") {
      discountPercent = 15;
    } else if (cleanPromo === "INDIA10") {
      discountPercent = 10;
    } else if (cleanPromo === "LUXURY5") {
      discountPercent = 5;
    }
  }

  const discountAmount = Math.round(grossSubtotal * (discountPercent / 100));
  const subtotal = Math.max(0, grossSubtotal - discountAmount);
  const taxes = Math.round(subtotal * (Number(taxPercent) / 100));
  const total = subtotal + taxes;

  return {
    doublePrice,
    triplePrice,
    quadPrice,
    totalGuestsCount,
    grossSubtotal,
    discountPercent,
    discountAmount,
    subtotal,
    taxes,
    total,
    amountInPaise: total * 100,
  };
};

/**
 * Calculate complete order financial breakdown
 * @param {number} pricePerPerson
 * @param {number} guests
 * @param {number} discountPercent
 * @param {number} taxPercent (default 5% GST)
 */
export const calculateOrderFinancials = (
  pricePerPerson,
  guests = 1,
  discountPercent = 0,
  taxPercent = 5
) => {
  const basePrice = Number(pricePerPerson) * Number(guests);
  const discountAmount = Math.round(
    basePrice * (Number(discountPercent) / 100)
  );
  const subtotal = Math.max(0, basePrice - discountAmount);
  const taxes = Math.round(subtotal * (Number(taxPercent) / 100));
  const total = subtotal + taxes;

  return {
    basePrice,
    discountAmount,
    subtotal,
    taxes,
    total,
    amountInPaise: total * 100,
  };
};

/**
 * Generate human-readable unique order ID
 * e.g., BMI-2026-8942
 */
export const generateOrderId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `BMI-${year}-${randomDigits}`;
};
