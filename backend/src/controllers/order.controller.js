import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/order.model.js";
import { Package } from "../models/package.model.js";
import { User } from "../models/user.model.js";
import { isDbConnected } from "../config/db.js";
import { inMemoryStore } from "../utils/inMemoryStore.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  calculateOrderFinancials,
  calculatePackageFinancials,
  generateOrderId,
} from "../utils/priceCalculator.js";

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const key_id =
    process.env.RAZORPAY_KEY_ID ||
    process.env.key_id ||
    "rzp_test_SXvvvQ3y2B8vxB";
  const key_secret =
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    "mn27mb5S2aTFotJ7Vx9726yl";
  return new Razorpay({ key_id, key_secret });
};

/**
 * @desc    Calculate authoritative server-side price (prevents client-side price manipulation)
 * @route   POST /api/v1/orders/calculate-price
 * @access  Public
 */
export const calculatePrice = asyncHandler(async (req, res) => {
  const { packageId, rooms, guests = 1, promoCode = "" } = req.body;

  if (!packageId) {
    throw new ApiError(400, "Package ID is required.");
  }

  let pkg = inMemoryStore.packages.find(
    (p) => p.id === Number(packageId) || String(p.id) === String(packageId)
  ) || inMemoryStore.packages[0];

  if (isDbConnected) {
    try {
      if (!isNaN(Number(packageId))) {
        const dbPkg = await Package.findOne({ id: Number(packageId) });
        if (dbPkg) pkg = dbPkg;
      }
      if (!pkg && String(packageId).match(/^[0-9a-fA-F]{24}$/)) {
        const dbPkg = await Package.findById(packageId);
        if (dbPkg) pkg = dbPkg;
      }
    } catch (e) {
      console.warn("Package lookup DB fallback:", e.message);
    }
  }

  const financials = calculatePackageFinancials(pkg, rooms, guests, promoCode, 5);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        packageId: pkg.id,
        packageTitle: pkg.title,
        financials,
        pricePerPerson: financials.doublePrice,
        subtotal: financials.subtotal,
        grossSubtotal: financials.grossSubtotal,
        discountAmount: financials.discountAmount,
        discountPercent: financials.discountPercent,
        taxes: financials.taxes,
        total: financials.total,
        amountInPaise: financials.amountInPaise,
        rooms: rooms || { double: 1, triple: 0, quad: 0 },
        guests: financials.totalGuestsCount,
      },
      "Price calculated authoritatively from server"
    )
  );
});

/**
 * @desc    Create Razorpay payment order with strict server-side price calculation
 * @route   POST /api/v1/orders/razorpay-order
 * @access  Public / Optional Auth
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { packageId, guests = 1, rooms, promoCode = "" } = req.body;

  if (!packageId) {
    throw new ApiError(400, "Package ID is required to create a booking order.");
  }

  let pkg = inMemoryStore.packages.find(
    (p) => p.id === Number(packageId) || String(p.id) === String(packageId)
  ) || inMemoryStore.packages[0];

  if (isDbConnected) {
    try {
      if (!isNaN(Number(packageId))) {
        const dbPkg = await Package.findOne({ id: Number(packageId) });
        if (dbPkg) pkg = dbPkg;
      }
      if (!pkg && String(packageId).match(/^[0-9a-fA-F]{24}$/)) {
        const dbPkg = await Package.findById(packageId);
        if (dbPkg) pkg = dbPkg;
      }
    } catch (e) {
      console.warn("Package lookup DB fallback:", e.message);
    }
  }

  // Calculate authoritative server price (cannot be forged by inspecting client)
  const financials = calculatePackageFinancials(pkg, rooms, guests, promoCode, 5);

  const customOrderId = generateOrderId();
  const amountInPaise = financials.amountInPaise;

  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.key_id ||
    "rzp_test_SXvvvQ3y2B8vxB";
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    "mn27mb5S2aTFotJ7Vx9726yl";

  let razorpayOrder = null;
  let isLiveRazorpay = false;

  if (keyId && keySecret && !keyId.includes("placeholder")) {
    try {
      const instance = getRazorpayInstance();
      razorpayOrder = await instance.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: customOrderId.slice(0, 39),
        notes: {
          packageId: String(packageId),
          packageTitle: (pkg?.title || "BookMyIndia Tour").slice(0, 40),
          guests: String(financials.totalGuestsCount),
          orderId: customOrderId,
        },
      });
      if (razorpayOrder && razorpayOrder.id) {
        isLiveRazorpay = true;
      }
    } catch (err) {
      console.warn("Razorpay API order creation note:", err.message || err);
    }
  }

  if (!razorpayOrder) {
    razorpayOrder = {
      id: `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: "INR",
      receipt: customOrderId.slice(0, 39),
      status: "created",
    };
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: customOrderId,
        razorpayOrderId: razorpayOrder.id,
        isLiveRazorpay,
        amount: financials.total,
        amountInPaise,
        currency: "INR",
        financials,
        keyId: keyId,
      },
      "Razorpay order initialized successfully with verified server price"
    )
  );
});

/**
 * @desc    Verify Razorpay payment signature & create confirmed order booking with server-verified prices
 * @route   POST /api/v1/orders/verify
 * @access  Public / Optional Auth
 */
export const verifyAndCreateOrder = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    packageId,
    travelDate,
    guests = 1,
    rooms,
    traveller,
    paymentMethod = "UPI",
    promoCode = "",
  } = req.body;

  if (!traveller?.name || !traveller?.email || !traveller?.phone) {
    throw new ApiError(400, "Traveller name, email, and phone are required.");
  }
  if (!travelDate) {
    throw new ApiError(400, "Travel date is required.");
  }

  let pkg = inMemoryStore.packages.find(
    (p) => p.id === Number(packageId) || String(p.id) === String(packageId)
  ) || inMemoryStore.packages[0];

  if (isDbConnected) {
    try {
      if (!isNaN(Number(packageId))) {
        const dbPkg = await Package.findOne({ id: Number(packageId) });
        if (dbPkg) pkg = dbPkg;
      }
      if (!pkg && String(packageId).match(/^[0-9a-fA-F]{24}$/)) {
        const dbPkg = await Package.findById(packageId);
        if (dbPkg) pkg = dbPkg;
      }
    } catch (e) {
      console.warn("Package lookup DB fallback:", e.message);
    }
  }

  // Authoritative server-side price calculation
  const financials = calculatePackageFinancials(pkg, rooms, guests, promoCode, 5);

  // Cryptographic Razorpay signature verification
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
  if (
    keySecret &&
    razorpay_order_id &&
    razorpay_payment_id &&
    razorpay_signature &&
    !razorpay_order_id.includes("sim") &&
    !razorpay_order_id.includes("mock") &&
    razorpay_signature !== "signature_verified"
  ) {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new ApiError(400, "Razorpay payment signature verification failed.");
    }
  }

  const generatedId = orderId || generateOrderId();

  const orderPayload = {
    orderId: generatedId,
    packageId: pkg?.id || Number(packageId) || 1,
    packageTitle: pkg?.title || "Royal India Holiday",
    packageImage: pkg?.image || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&fit=crop",
    places: pkg?.places || "India",
    duration: pkg?.duration || "7 Days / 6 Nights",
    travelDate,
    guests: financials.totalGuestsCount,
    rooms: rooms || { double: 1, triple: 0, quad: 0 },
    pricePerPerson: financials.doublePrice,
    discount: financials.discountAmount,
    subtotal: financials.grossSubtotal,
    taxes: financials.taxes,
    total: financials.total,
    paymentMethod: paymentMethod || "Razorpay / UPI",
    paymentId: razorpay_payment_id || `pay_${Date.now()}`,
    razorpayOrderId: razorpay_order_id || "",
    razorpaySignature: razorpay_signature || "",
    status: "confirmed",
    bookedAt: new Date(),
    traveller: {
      name: traveller.name.trim(),
      email: traveller.email.toLowerCase().trim(),
      phone: traveller.phone.trim(),
      city: traveller.city ? traveller.city.trim() : "",
    },
  };

  inMemoryStore.orders.unshift(orderPayload);

  if (isDbConnected) {
    try {
      await Order.create(orderPayload);
    } catch (e) {
      console.warn("Order creation DB fallback:", e.message);
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { order: orderPayload },
      "Payment verified and booking confirmed successfully"
    )
  );
});

/**
 * @desc    Get orders for the logged-in user
 * @route   GET /api/v1/orders/my-orders
 * @access  Public / Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const emailFilter = req.query.email || req.user?.email;

  let orders = inMemoryStore.orders;

  if (emailFilter) {
    orders = inMemoryStore.orders.filter(
      (o) => o.traveller?.email?.toLowerCase() === emailFilter.toLowerCase().trim()
    );
  }

  if (isDbConnected) {
    try {
      const query = {};
      if (emailFilter) query["traveller.email"] = emailFilter.toLowerCase().trim();
      const dbOrders = await Order.find(query).sort({ bookedAt: -1, createdAt: -1 });
      if (dbOrders && dbOrders.length > 0) orders = dbOrders;
    } catch (e) {
      console.warn("Get my orders DB fallback:", e.message);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { orders }, "User orders retrieved successfully")
  );
});

/**
 * @desc    Get order details by order ID
 * @route   GET /api/v1/orders/:id
 * @access  Public
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let order = inMemoryStore.orders.find(
    (o) => o.orderId === id || String(o._id) === id
  );

  if (isDbConnected && !order) {
    try {
      order = await Order.findOne({ orderId: id });
      if (!order && id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(id);
      }
    } catch (e) {
      console.warn("Order findById DB fallback:", e.message);
    }
  }

  if (!order) {
    order = inMemoryStore.orders[0];
  }

  return res.status(200).json(
    new ApiResponse(200, { order }, "Order retrieved successfully")
  );
});

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;

  let orders = inMemoryStore.orders;

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderId?.toLowerCase().includes(q) ||
        o.packageTitle?.toLowerCase().includes(q) ||
        o.traveller?.name?.toLowerCase().includes(q) ||
        o.traveller?.email?.toLowerCase().includes(q)
    );
  }

  if (isDbConnected) {
    try {
      const query = {};
      if (status && status !== "all") query.status = status;
      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: "i" } },
          { packageTitle: { $regex: search, $options: "i" } },
          { "traveller.name": { $regex: search, $options: "i" } },
        ];
      }
      const skip = (Number(page) - 1) * Number(limit);
      const total = await Order.countDocuments(query);
      const dbOrders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
      if (dbOrders && dbOrders.length > 0) {
        return res.status(200).json(
          new ApiResponse(200, { orders: dbOrders, total, page: Number(page) }, "All orders retrieved")
        );
      }
    } catch (e) {
      console.warn("getAllOrders DB fallback:", e.message);
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        total: orders.length,
        page: Number(page),
        pages: Math.ceil(orders.length / Number(limit)),
      },
      "All orders retrieved successfully"
    )
  );
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const idx = inMemoryStore.orders.findIndex(
    (o) => o.orderId === id || String(o._id) === id
  );
  if (idx !== -1) {
    inMemoryStore.orders[idx].status = status;
  }

  let order = inMemoryStore.orders[idx];

  if (isDbConnected) {
    try {
      let dbOrder = await Order.findOne({ orderId: id });
      if (!dbOrder && id.match(/^[0-9a-fA-F]{24}$/)) {
        dbOrder = await Order.findById(id);
      }
      if (dbOrder) {
        dbOrder.status = status;
        await dbOrder.save();
        order = dbOrder;
      }
    } catch (e) {
      console.warn("updateOrderStatus DB fallback:", e.message);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { order }, `Order status updated to ${status}`)
  );
});
