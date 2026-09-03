import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
    },
    packageId: {
      type: Number,
      required: true,
    },
    packageTitle: {
      type: String,
      required: true,
    },
    packageImage: {
      type: String,
      default: "",
    },
    places: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    travelDate: {
      type: String,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      default: 1,
    },
    rooms: {
      double: { type: Number, default: 0 },
      triple: { type: Number, default: 0 },
      quad: { type: Number, default: 0 },
    },
    pricePerPerson: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxes: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "UPI",
    },
    paymentId: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    traveller: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
