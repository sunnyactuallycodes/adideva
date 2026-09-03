import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Package } from "../models/package.model.js";
import { Order } from "../models/order.model.js";

dotenv.config();

const initialPackages = [
  {
    id: 1,
    title: "Golden Triangle Heritage",
    places: "Delhi · Agra · Jaipur",
    duration: "7 Days / 6 Nights",
    days: 7,
    nights: 6,
    price: 24999,
    originalPrice: 32000,
    rating: 4.8,
    reviews: 1243,
    badge: "Bestseller",
    badgeColor: "#A2191B",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=460&fit=crop&auto=format",
    category: "Heritage",
    highlights: ["Taj Mahal Sunrise", "Amber Fort Jeep Ride", "Rambagh Palace Stay", "3 UNESCO Sites"],
    maxGuests: 16,
    active: true,
  },
  {
    id: 2,
    title: "Kerala Backwaters Bliss",
    places: "Kochi · Alleppey · Munnar",
    duration: "6 Days / 5 Nights",
    days: 6,
    nights: 5,
    price: 19499,
    originalPrice: 25000,
    rating: 4.9,
    reviews: 987,
    badge: "Top Rated",
    badgeColor: "#1a7a3c",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&h=460&fit=crop&auto=format",
    category: "Nature",
    highlights: ["Houseboat Stay", "Spice Plantation Tour", "Kathakali Show", "Munnar Tea Gardens"],
    maxGuests: 12,
    active: true,
  },
  {
    id: 3,
    title: "Rajasthan Royal Circuit",
    places: "Udaipur · Jodhpur · Jaisalmer",
    duration: "10 Days / 9 Nights",
    days: 10,
    nights: 9,
    price: 38999,
    originalPrice: 48000,
    rating: 4.7,
    reviews: 2105,
    badge: "Premium",
    badgeColor: "#8B6914",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=700&h=460&fit=crop&auto=format",
    category: "Heritage",
    highlights: ["Desert Safari", "Palace Hotel Stays", "Camel Trek", "Folk Evening Dinner"],
    maxGuests: 14,
    active: true,
  },
  {
    id: 4,
    title: "Himalayan Serenity",
    places: "Shimla · Manali · Kasol",
    duration: "8 Days / 7 Nights",
    days: 8,
    nights: 7,
    price: 22499,
    originalPrice: 29000,
    rating: 4.6,
    reviews: 756,
    badge: "Adventure",
    badgeColor: "#1a5c8a",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=700&h=460&fit=crop&auto=format",
    category: "Adventure",
    highlights: ["Solang Valley Trek", "River Rafting", "Mall Road Shimla", "Kheerganga Hot Springs"],
    maxGuests: 10,
    active: true,
  },
  {
    id: 5,
    title: "Goa Coastal Escape",
    places: "North Goa · South Goa",
    duration: "5 Days / 4 Nights",
    days: 5,
    nights: 4,
    price: 15999,
    originalPrice: 20000,
    rating: 4.5,
    reviews: 1876,
    badge: "Popular",
    badgeColor: "#A2191B",
    image: "https://images.unsplash.com/photo-1587922546307-776227941871?w=700&h=460&fit=crop&auto=format",
    category: "Beach",
    highlights: ["Beach Resort Stay", "Sunset Cruise", "Dudhsagar Falls Trip", "Old Goa Churches"],
    maxGuests: 20,
    active: true,
  },
  {
    id: 6,
    title: "Varanasi Spiritual Journey",
    places: "Varanasi · Sarnath · Prayagraj",
    duration: "4 Days / 3 Nights",
    days: 4,
    nights: 3,
    price: 12999,
    originalPrice: 16500,
    rating: 4.8,
    reviews: 634,
    badge: "Cultural",
    badgeColor: "#7a2a8a",
    image: "https://images.unsplash.com/photo-1561361058-c24e015d0d4b?w=700&h=460&fit=crop&auto=format",
    category: "Cultural",
    highlights: ["Ganga Aarti Ceremony", "Boat Ride at Dawn", "Sarnath Buddhist Tour", "Heritage Walk"],
    maxGuests: 16,
    active: true,
  },
  {
    id: 7,
    title: "Kashmir Valley Paradise",
    places: "Srinagar · Gulmarg · Pahalgam",
    duration: "7 Days / 6 Nights",
    days: 7,
    nights: 6,
    price: 28999,
    originalPrice: 36000,
    rating: 4.9,
    reviews: 1420,
    badge: "Honeymoon Special",
    badgeColor: "#A2191B",
    image: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=700&h=460&fit=crop&auto=format",
    category: "Honeymoon",
    highlights: ["Dal Lake Shikara Stay", "Gulmarg Gondola Ride", "Pahalgam Valley Trek", "Mughal Gardens Tour"],
    maxGuests: 12,
    active: true,
  },
  {
    id: 8,
    title: "Ladakh High-Altitude Odyssey",
    places: "Leh · Nubra Valley · Pangong Tso",
    duration: "8 Days / 7 Nights",
    days: 8,
    nights: 7,
    price: 34999,
    originalPrice: 42000,
    rating: 4.9,
    reviews: 890,
    badge: "Bucket List",
    badgeColor: "#1a5c8a",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=700&h=460&fit=crop&auto=format",
    category: "Adventure",
    highlights: ["Pangong Lake Camping", "Khardung La Pass (18,380ft)", "Bactrian Camel Safari", "Thiksey Monastery"],
    maxGuests: 10,
    active: true,
  },
  {
    id: 9,
    title: "Andaman Tropical Haven",
    places: "Port Blair · Havelock · Neil Island",
    duration: "6 Days / 5 Nights",
    days: 6,
    nights: 5,
    price: 27499,
    originalPrice: 35000,
    rating: 4.8,
    reviews: 1105,
    badge: "Island Retreat",
    badgeColor: "#0d9488",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=700&h=460&fit=crop&auto=format",
    category: "Beach",
    highlights: ["Radhanagar Beach Sunset", "Scuba Diving & Snorkeling", "Cellular Jail Light & Sound", "Catamaran Cruise"],
    maxGuests: 14,
    active: true,
  },
  {
    id: 10,
    title: "Coorg & Mysore Royal Coffee Trail",
    places: "Mysore · Coorg · Kabini",
    duration: "5 Days / 4 Nights",
    days: 5,
    nights: 4,
    price: 18999,
    originalPrice: 24000,
    rating: 4.7,
    reviews: 520,
    badge: "Nature & Heritage",
    badgeColor: "#15803d",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=700&h=460&fit=crop&auto=format",
    category: "Nature",
    highlights: ["Mysore Palace Illumination", "Coffee Plantation Villa Stay", "Kabini Jungle Safari", "Abbey Waterfalls"],
    maxGuests: 16,
    active: true,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb+srv://wr3dman:Sunny123@cluster.l9sawiy.mongodb.net/bookmyindia?retryWrites=true&w=majority&appName=cluster";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Seed Master Admin User
    const adminEmail = "adideva@gmail.com";
    let existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      existingAdmin = await User.create({
        name: "Adideva Admin",
        email: adminEmail,
        password: "12345678",
        role: "admin",
        phone: "+91 98765 43210",
        city: "New Delhi",
      });
      console.log(` Admin created: ${adminEmail} / 12345678`);
    } else {
      existingAdmin.role = "admin";
      existingAdmin.password = "12345678";
      await existingAdmin.save();
      console.log(` Admin updated: ${adminEmail} / 12345678`);
    }

    // Seed Demo User
    const demoEmail = "traveller@bookmyindia.com";
    const existingUser = await User.findOne({ email: demoEmail });
    if (!existingUser) {
      await User.create({
        name: "Priya Sharma",
        email: demoEmail,
        password: "userpassword123",
        role: "user",
        phone: "+91 98765 43210",
        city: "Mumbai",
        totalBookings: 2,
        totalSpent: 44498,
      });
      console.log(` Demo User created: ${demoEmail} / userpassword123`);
    }

    // Seed Packages
    for (const pkg of initialPackages) {
      await Package.findOneAndUpdate({ id: pkg.id }, pkg, { upsert: true, new: true });
    }
    console.log(` Seeded ${initialPackages.length} travel packages.`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
