import mongoose, { Schema } from "mongoose";

const itineraryDaySchema = new Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    location: { type: String, default: "" },
    image: { type: String, default: "" },
    meals: [{ type: String }],
    hotel: { type: String, default: "" },
    description: { type: String, default: "" },
    highlights: [{ type: String }],
  },
  { _id: false }
);

const thingToCarrySchema = new Schema(
  {
    icon: { type: String, default: "🎒" },
    item: { type: String, required: true },
    critical: { type: Boolean, default: false },
  },
  { _id: false }
);

const galleryImageSchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, default: "Package photo" },
  },
  { _id: false }
);

const packagePricingSchema = new Schema(
  {
    double: { type: Number, default: 0 },
    triple: { type: Number, default: 0 },
    quad: { type: Number, default: 0 },
  },
  { _id: false }
);

const packageSchema = new Schema(
  {
    id: {
      type: Number,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
      index: true,
    },
    places: {
      type: String,
      required: [true, "Destinations/places are required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration string is required"],
      default: "7 Days / 6 Nights",
    },
    days: {
      type: Number,
      default: 7,
    },
    nights: {
      type: Number,
      default: 6,
    },
    overview: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    pricing: {
      type: packagePricingSchema,
      default: () => ({ double: 0, triple: 0, quad: 0 }),
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    pickupLocation: {
      type: String,
      default: "IGI Airport, New Delhi",
    },
    dropLocation: {
      type: String,
      default: "Airport / Railway Station",
    },
    bestSeason: {
      type: String,
      default: "Oct – Mar",
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      default: "Featured",
    },
    badgeColor: {
      type: String,
      default: "#A2191B",
    },
    image: {
      type: String,
      required: [true, "Primary image URL is required"],
    },
    images: [{ type: String }],
    galleryImages: [galleryImageSchema],
    category: {
      type: String,
      default: "Heritage",
      index: true,
    },
    highlights: [{ type: String }],
    maxGuests: {
      type: Number,
      default: 16,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    departureDates: [{ type: String }],
    itinerary: [itineraryDaySchema],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    thingsToCarry: [thingToCarrySchema],
  },
  {
    timestamps: true,
  }
);

// Auto-assign numeric id if not provided
packageSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = Date.now();
  }
  if (!this.originalPrice || this.originalPrice < this.price) {
    this.originalPrice = Math.round(this.price * 1.25);
  }
  if (!this.pricing || !this.pricing.double) {
    this.pricing = {
      double: this.price,
      triple: Math.round(this.price * 0.9),
      quad: Math.round(this.price * 0.8),
    };
  }
  next();
});

export const Package = mongoose.model("Package", packageSchema);
