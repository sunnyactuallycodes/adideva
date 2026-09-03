export interface ItineraryDay {
  day: number;
  title: string;
  location?: string;
  image?: string;
  meals?: string[];
  hotel?: string;
  description?: string;
  highlights?: string[];
}

export interface ThingToCarry {
  icon: string;
  item: string;
  critical?: boolean;
}

export interface GalleryPhoto {
  src: string;
  alt?: string;
}

export interface PackagePricing {
  double: number;
  triple: number;
  quad: number;
}

export interface Package {
  id: number;
  title: string;
  places: string;
  duration: string;
  days: number;
  nights: number;
  overview?: string;
  price: number;
  pricing?: PackagePricing;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge: string;
  badgeColor: string;
  image: string;
  images?: string[];
  galleryImages?: GalleryPhoto[];
  category: string;
  highlights: string[];
  maxGuests: number;
  active: boolean;
  pickupLocation?: string;
  dropLocation?: string;
  bestSeason?: string;
  departureDates?: string[];
  itinerary?: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  thingsToCarry?: ThingToCarry[];
}

export interface RoomSelection {
  double: number;
  triple: number;
  quad: number;
}

export function totalGuests(rooms: RoomSelection): number {
  return rooms.double * 2 + rooms.triple * 3 + rooms.quad * 4;
}

export interface Traveller {
  name: string;
  email: string;
  phone: string;
  city: string;
}

export interface Order {
  orderId: string;
  packageId: number;
  packageTitle: string;
  packageImage: string;
  places: string;
  duration: string;
  travelDate: string;
  guests: number;
  rooms?: RoomSelection;
  pricePerPerson: number;
  discount: number;
  subtotal: number;
  taxes: number;
  total: number;
  paymentMethod: string;
  paymentId: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  bookedAt: string;
  traveller: Traveller;
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export const initialPackages: Package[] = [
  {
    id: 1,
    title: "Golden Triangle Heritage",
    places: "Delhi · Agra · Jaipur",
    duration: "7 Days / 6 Nights",
    days: 7, nights: 6,
    price: 24999, originalPrice: 32000,
    rating: 4.8, reviews: 1243,
    badge: "Bestseller", badgeColor: "#A2191B",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=460&fit=crop&auto=format",
    category: "Heritage",
    highlights: ["Taj Mahal Sunrise", "Amber Fort Jeep Ride", "Rambagh Palace Stay", "3 UNESCO Sites"],
    maxGuests: 16, active: true,
  },
  {
    id: 2,
    title: "Kerala Backwaters Bliss",
    places: "Kochi · Alleppey · Munnar",
    duration: "6 Days / 5 Nights",
    days: 6, nights: 5,
    price: 19499, originalPrice: 25000,
    rating: 4.9, reviews: 987,
    badge: "Top Rated", badgeColor: "#1a7a3c",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&h=460&fit=crop&auto=format",
    category: "Nature",
    highlights: ["Houseboat Stay", "Spice Plantation Tour", "Kathakali Show", "Munnar Tea Gardens"],
    maxGuests: 12, active: true,
  },
  {
    id: 3,
    title: "Rajasthan Royal Circuit",
    places: "Udaipur · Jodhpur · Jaisalmer",
    duration: "10 Days / 9 Nights",
    days: 10, nights: 9,
    price: 38999, originalPrice: 48000,
    rating: 4.7, reviews: 2105,
    badge: "Premium", badgeColor: "#8B6914",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=700&h=460&fit=crop&auto=format",
    category: "Heritage",
    highlights: ["Desert Safari", "Palace Hotel Stays", "Camel Trek", "Folk Evening Dinner"],
    maxGuests: 14, active: true,
  },
  {
    id: 4,
    title: "Himalayan Serenity",
    places: "Shimla · Manali · Kasol",
    duration: "8 Days / 7 Nights",
    days: 8, nights: 7,
    price: 22499, originalPrice: 29000,
    rating: 4.6, reviews: 756,
    badge: "Adventure", badgeColor: "#1a5c8a",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=700&h=460&fit=crop&auto=format",
    category: "Adventure",
    highlights: ["Solang Valley Trek", "River Rafting", "Mall Road Shimla", "Kheerganga Hot Springs"],
    maxGuests: 10, active: true,
  },
  {
    id: 5,
    title: "Goa Coastal Escape",
    places: "North Goa · South Goa",
    duration: "5 Days / 4 Nights",
    days: 5, nights: 4,
    price: 15999, originalPrice: 20000,
    rating: 4.5, reviews: 1876,
    badge: "Popular", badgeColor: "#A2191B",
    image: "https://images.unsplash.com/photo-1587922546307-776227941871?w=700&h=460&fit=crop&auto=format",
    category: "Beach",
    highlights: ["Beach Resort Stay", "Sunset Cruise", "Dudhsagar Falls Trip", "Old Goa Churches"],
    maxGuests: 20, active: true,
  },
  {
    id: 6,
    title: "Varanasi Spiritual Journey",
    places: "Varanasi · Sarnath · Prayagraj",
    duration: "4 Days / 3 Nights",
    days: 4, nights: 3,
    price: 12999, originalPrice: 16500,
    rating: 4.8, reviews: 634,
    badge: "Cultural", badgeColor: "#7a2a8a",
    image: "https://images.unsplash.com/photo-1561361058-c24e015d0d4b?w=700&h=460&fit=crop&auto=format",
    category: "Cultural",
    highlights: ["Ganga Aarti Ceremony", "Boat Ride at Dawn", "Sarnath Buddhist Tour", "Heritage Walk"],
    maxGuests: 16, active: true,
  },
  {
    id: 7,
    title: "Kashmir Valley Paradise",
    places: "Srinagar · Gulmarg · Pahalgam",
    duration: "7 Days / 6 Nights",
    days: 7, nights: 6,
    price: 28999, originalPrice: 36000,
    rating: 4.9, reviews: 1420,
    badge: "Honeymoon Special", badgeColor: "#A2191B",
    image: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=700&h=460&fit=crop&auto=format",
    category: "Honeymoon",
    highlights: ["Dal Lake Shikara Stay", "Gulmarg Gondola Ride", "Pahalgam Valley Trek", "Mughal Gardens Tour"],
    maxGuests: 12, active: true,
  },
  {
    id: 8,
    title: "Ladakh High-Altitude Odyssey",
    places: "Leh · Nubra Valley · Pangong Tso",
    duration: "8 Days / 7 Nights",
    days: 8, nights: 7,
    price: 34999, originalPrice: 42000,
    rating: 4.9, reviews: 890,
    badge: "Bucket List", badgeColor: "#1a5c8a",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=700&h=460&fit=crop&auto=format",
    category: "Adventure",
    highlights: ["Pangong Lake Camping", "Khardung La Pass (18,380ft)", "Bactrian Camel Safari", "Thiksey Monastery"],
    maxGuests: 10, active: true,
  },
  {
    id: 9,
    title: "Andaman Tropical Haven",
    places: "Port Blair · Havelock · Neil Island",
    duration: "6 Days / 5 Nights",
    days: 6, nights: 5,
    price: 27499, originalPrice: 35000,
    rating: 4.8, reviews: 1105,
    badge: "Island Retreat", badgeColor: "#0d9488",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=700&h=460&fit=crop&auto=format",
    category: "Beach",
    highlights: ["Radhanagar Beach Sunset", "Scuba Diving & Snorkeling", "Cellular Jail Light & Sound", "Catamaran Cruise"],
    maxGuests: 14, active: true,
  },
  {
    id: 10,
    title: "Coorg & Mysore Royal Coffee Trail",
    places: "Mysore · Coorg · Kabini",
    duration: "5 Days / 4 Nights",
    days: 5, nights: 4,
    price: 18999, originalPrice: 24000,
    rating: 4.7, reviews: 520,
    badge: "Nature & Heritage", badgeColor: "#15803d",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=700&h=460&fit=crop&auto=format",
    category: "Nature",
    highlights: ["Mysore Palace Illumination", "Coffee Plantation Villa Stay", "Kabini Jungle Safari", "Abbey Waterfalls"],
    maxGuests: 16, active: true,
  },
];

export const packages = initialPackages;

export const departureDates = [
  "15 Oct 2025", "22 Oct 2025", "05 Nov 2025",
  "19 Nov 2025", "10 Dec 2025", "24 Dec 2025",
  "07 Jan 2026", "21 Jan 2026",
];

// ─── Mock users ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedAt: string;
  totalBookings: number;
  totalSpent: number;
  status: "active" | "inactive";
  avatar: string;
}

export const mockUsers: User[] = [
  { id: "U001", name: "Priya Sharma", email: "priya.sharma@gmail.com", phone: "+91 98765 43210", city: "Mumbai", joinedAt: "2024-03-15", totalBookings: 3, totalSpent: 89450, status: "active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" },
  { id: "U002", name: "Arjun Mehta", email: "arjun.mehta@outlook.com", phone: "+91 87654 32109", city: "Bangalore", joinedAt: "2024-05-22", totalBookings: 2, totalSpent: 63946, status: "active", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" },
  { id: "U003", name: "Neha Kapoor", email: "neha.kapoor@gmail.com", phone: "+91 76543 21098", city: "Delhi", joinedAt: "2024-01-08", totalBookings: 5, totalSpent: 215000, status: "active", avatar: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=60&h=60&fit=crop" },
  { id: "U004", name: "Vikram Singh", email: "vikram.singh@hotmail.com", phone: "+91 65432 10987", city: "Jaipur", joinedAt: "2024-07-11", totalBookings: 1, totalSpent: 22499, status: "active", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop" },
  { id: "U005", name: "Sunita Rao", email: "sunita.rao@gmail.com", phone: "+91 54321 09876", city: "Hyderabad", joinedAt: "2024-09-03", totalBookings: 0, totalSpent: 0, status: "inactive", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop" },
  { id: "U006", name: "Rohit Desai", email: "rohit.desai@gmail.com", phone: "+91 43210 98765", city: "Pune", joinedAt: "2024-11-19", totalBookings: 2, totalSpent: 45998, status: "active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop" },
];

// ─── Mock pre-existing orders ─────────────────────────────────────────────────

export const mockOrders: Order[] = [
  {
    orderId: "BMI-2025-0041",
    packageId: 2, packageTitle: "Kerala Backwaters Bliss",
    packageImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&h=460&fit=crop&auto=format",
    places: "Kochi · Alleppey · Munnar", duration: "6 Days / 5 Nights",
    travelDate: "05 Nov 2025", guests: 2,
    rooms: { double: 1, triple: 0, quad: 0 },
    pricePerPerson: 19499, discount: 0, subtotal: 38998, taxes: 1950, total: 40948,
    paymentMethod: "UPI", paymentId: "pay_QmX9Kd83jLp2Aw",
    status: "confirmed", bookedAt: "2025-09-14T10:30:00Z",
    traveller: { name: "Priya Sharma", email: "priya.sharma@gmail.com", phone: "+91 98765 43210", city: "Mumbai" },
  },
  {
    orderId: "BMI-2025-0028",
    packageId: 5, packageTitle: "Goa Coastal Escape",
    packageImage: "https://images.unsplash.com/photo-1587922546307-776227941871?w=700&h=460&fit=crop&auto=format",
    places: "North Goa · South Goa", duration: "5 Days / 4 Nights",
    travelDate: "22 Oct 2025", guests: 3,
    rooms: { double: 0, triple: 1, quad: 0 },
    pricePerPerson: 15999, discount: 2400, subtotal: 47997, taxes: 2400, total: 47997,
    paymentMethod: "Credit Card", paymentId: "pay_NvW7Hs61kMr4Bz",
    status: "confirmed", bookedAt: "2025-08-30T14:15:00Z",
    traveller: { name: "Arjun Mehta", email: "arjun.mehta@outlook.com", phone: "+91 87654 32109", city: "Bangalore" },
  },
  {
    orderId: "BMI-2025-0012",
    packageId: 3, packageTitle: "Rajasthan Royal Circuit",
    packageImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=700&h=460&fit=crop&auto=format",
    places: "Udaipur · Jodhpur · Jaisalmer", duration: "10 Days / 9 Nights",
    travelDate: "15 Feb 2025", guests: 4,
    rooms: { double: 0, triple: 0, quad: 1 },
    pricePerPerson: 38999, discount: 0, subtotal: 155996, taxes: 7800, total: 163796,
    paymentMethod: "Net Banking", paymentId: "pay_KbT5Jq40nCe8Vx",
    status: "completed", bookedAt: "2025-01-10T09:00:00Z",
    traveller: { name: "Neha Kapoor", email: "neha.kapoor@gmail.com", phone: "+91 76543 21098", city: "Delhi" },
  },
];
