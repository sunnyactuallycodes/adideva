import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Clock,
  Heart,
  Mountain,
  Waves,
  Camera,
  TreePine,
  Plane,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  Phone,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Quote,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { type Package } from "../data";
import { useStore } from "../store";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

const categories = [
  { icon: Camera, label: "Heritage" },
  { icon: Waves, label: "Beach" },
  { icon: Mountain, label: "Adventure" },
  { icon: TreePine, label: "Nature" },
  { icon: Plane, label: "Honeymoon" },
];

const popularDestinations = [
  {
    name: "Rajasthan",
    sub: "Palaces & Forts",
    packagesCount: "12 Tours",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=800&fit=crop&auto=format",
    tag: "Royal Heritage",
    category: "Heritage",
  },
  {
    name: "Kerala",
    sub: "Backwaters & Tea Hills",
    packagesCount: "8 Tours",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=800&fit=crop&auto=format",
    tag: "God's Own Country",
    category: "Nature",
  },
  {
    name: "Himachal Pradesh",
    sub: "Snow Peaks & Valleys",
    packagesCount: "10 Tours",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=800&fit=crop&auto=format",
    tag: "Himalayan Escape",
    category: "Adventure",
  },
  {
    name: "Goa",
    sub: "Sun, Sand & Heritage",
    packagesCount: "6 Tours",
    image: "https://images.unsplash.com/photo-1587922546307-776227941871?w=600&h=800&fit=crop&auto=format",
    tag: "Coastal Vibe",
    category: "Beach",
  },
  {
    name: "Varanasi & Ganga",
    sub: "Spiritual Dawn & Ghats",
    packagesCount: "4 Tours",
    image: "https://images.unsplash.com/photo-1561361058-c24e015d0d4b?w=600&h=800&fit=crop&auto=format",
    tag: "Ancient Soul",
    category: "Cultural",
  },
];

const testimonials = [
  {
    name: "Vikramaditya Singhania",
    role: "CEO, Singhania Group",
    city: "Mumbai",
    review:
      "Our Rajasthan Royal Circuit was executed with impeccable flawlessness. The stay at Rambagh Palace and the private sunrise tour of the Taj Mahal arranged by BookMyIndia was nothing short of royalty.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    tour: "Rajasthan Royal Circuit",
  },
  {
    name: "Ananya & Rohan Iyer",
    role: "Honeymooners",
    city: "Bangalore",
    review:
      "The private luxury houseboat in Alleppey and the mist-covered tea estate villa in Munnar exceeded our wildest dreams. The 24/7 dedicated trip captain made everything effortless.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    tour: "Kerala Backwaters Bliss",
  },
  {
    name: "Meera Chandrasekhar",
    role: "Architect & Historian",
    city: "New Delhi",
    review:
      "As someone deeply obsessed with Mughal architecture, the ASI-certified private guides and early access arrangements to Amber Fort made this the best cultural tour I have ever taken.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    tour: "Golden Triangle Heritage",
  },
];

const faqs = [
  {
    q: "What is included in BookMyIndia premium packages?",
    a: "All our packages include 5-star or heritage boutique hotel accommodations, daily breakfast and curated local gourmet dinners, private air-conditioned luxury vehicle transportation, certified English-speaking guides, all monument admissions, and 24/7 on-trip concierge support.",
  },
  {
    q: "Can I customize an existing itinerary or extend my stay?",
    a: "Yes! Every itinerary can be tailored to your preferences. You can add extra days, upgrade room categories to luxury suites, or request private helicopter transfers by speaking with your dedicated trip designer.",
  },
  {
    q: "What is the cancellation and refund policy?",
    a: "We offer 100% full refund on cancellations made 30 or more days before departure. Cancellations between 20–29 days receive a 75% refund. All refunds are processed back to your original payment method within 7–10 working days.",
  },
  {
    q: "How does the payment and Razorpay checkout work?",
    a: "We utilize official 256-bit encrypted Razorpay payment gateways supporting UPI (GPay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards, Net Banking, and flexible no-cost EMI options with instant booking confirmation.",
  },
];

function PackageCard({ pkg }: { pkg: Package }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const discount = Math.round(
    ((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100
  );

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-stone-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col cursor-pointer shadow-xs">
      <div
        className="relative h-60 overflow-hidden bg-[#f5f0eb]"
        onClick={() => navigate(`/package/${pkg.id}`)}
      >
        <img
          src={pkg.image}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        <div
          className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
          style={{ background: pkg.badgeColor || "#A2191B", ...mono }}
        >
          {pkg.badge}
        </div>

        {discount > 0 && (
          <div
            className="absolute top-3.5 right-12 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-[#1a7a3c] shadow-sm"
            style={mono}
          >
            −{discount}%
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm"
        >
          <Heart
            className="w-4 h-4 transition-colors"
            fill={liked ? "#FA0301" : "none"}
            stroke={liked ? "#FA0301" : "#7a5c5c"}
            strokeWidth={2}
          />
        </button>

        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-white text-xs font-medium" style={sans}>
            {pkg.duration}
          </span>
        </div>
      </div>

      <div
        className="p-6 flex flex-col flex-1"
        onClick={() => navigate(`/package/${pkg.id}`)}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span
            className="text-[11px] font-bold uppercase tracking-widest text-[#A2191B]"
            style={mono}
          >
            {pkg.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#FCBD70] stroke-[#FCBD70]" />
            <span className="text-xs font-bold text-stone-800" style={mono}>
              {pkg.rating}
            </span>
            <span className="text-xs text-stone-400" style={sans}>
              ({pkg.reviews})
            </span>
          </div>
        </div>

        <h3
          className="font-bold text-[#1a0a0a] text-lg leading-snug mb-1.5 group-hover:text-[#A2191B] transition-colors"
          style={serif}
        >
          {pkg.title}
        </h3>

        <div className="flex items-center gap-1.5 mb-3.5">
          <MapPin
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "#A2191B" }}
          />
          <span className="text-xs text-[#7a5c5c] line-clamp-1" style={sans}>
            {pkg.places}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {pkg.highlights.slice(0, 3).map((h) => (
            <span
              key={h}
              className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 bg-stone-50"
              style={sans}
            >
              {h}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
          <div>
            <div className="text-xs text-[#7a5c5c] line-through" style={sans}>
              ₹{pkg.originalPrice.toLocaleString()}
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-bold text-[#A2191B]"
                style={serif}
              >
                ₹{pkg.price.toLocaleString()}
              </span>
              <span className="text-xs text-[#7a5c5c]" style={sans}>
                /person
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/package/${pkg.id}`);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{
              background: "linear-gradient(135deg,#A2191B,#FA0301)",
              ...sans,
            }}
          >
            <span>Explore</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { packages: storePackages } = useStore();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [guests, setGuests] = useState(2);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const navigate = useNavigate();
  const packagesRef = useRef<HTMLElement | null>(null);

  const filters = [
    "All",
    "Heritage",
    "Nature",
    "Adventure",
    "Beach",
    "Cultural",
  ];

  const activeOnlyPkgs = storePackages.filter((p) => p.active);

  const filtered = activeOnlyPkgs.filter((p) => {
    const matchCategory = filter === "All" || p.category === filter;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.places.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSearchSubmit = () => {
    if (packagesRef.current) {
      packagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      <Nav transparent />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&h=1200&fit=crop&auto=format"
            alt="Taj Mahal at golden hour"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(20,5,5,0.2) 0%, rgba(20,5,5,0.55) 45%, rgba(20,5,5,0.92) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10 pb-16 pt-36">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: "#FCBD70" }} />
            <span
              className="text-xs md:text-sm font-bold tracking-widest uppercase"
              style={{ color: "#FCBD70", ...mono }}
            >
              Incredible India · Handcrafted Luxury
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 max-w-4xl tracking-tight"
            style={{ ...serif, lineHeight: "1.06" }}
          >
            Every Journey <br />
            <em className="not-italic" style={{ color: "#FCBD70" }}>
              Tells a Royal Story.
            </em>
          </h1>

          <p
            className="text-white/80 text-base md:text-lg max-w-xl mb-8"
            style={{ ...sans, fontWeight: 300 }}
          >
            Experience India’s most magnificent palace stays, backwater retreats, and mountain sanctuaries — curated with private chauffeurs and certified historians.
          </p>

          {/* Category quick selectors */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => {
                  setFilter(label);
                  if (packagesRef.current) {
                    packagesRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  filter === label
                    ? "text-white border-transparent shadow-md"
                    : "text-white/80 border-white/25 bg-white/10 hover:bg-white/20"
                }`}
                style={{
                  background:
                    filter === label
                      ? "linear-gradient(135deg,#A2191B,#FA0301)"
                      : undefined,
                  ...sans,
                }}
              >
                <Icon className="w-3.5 h-3.5 text-[#FCBD70]" />
                {label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-3xl shadow-2xl p-3 flex flex-col md:flex-row gap-3 max-w-4xl border border-stone-200/50">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#faf8f5] border border-[#A2191B]/10">
              <MapPin
                className="w-5 h-5 shrink-0"
                style={{ color: "#A2191B" }}
              />
              <div className="flex-1">
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: "#7a5c5c", ...mono }}
                >
                  Destination or Circuit
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Rajasthan, Kerala, Agra, Shimla…"
                  className="w-full bg-transparent text-sm text-[#1a0a0a] placeholder:text-[#7a5c5c]/50 outline-none"
                  style={sans}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                />
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#faf8f5] border border-[#A2191B]/10">
              <Calendar
                className="w-5 h-5 shrink-0"
                style={{ color: "#A2191B" }}
              />
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: "#7a5c5c", ...mono }}
                >
                  Departure Season
                </div>
                <div className="text-xs font-semibold text-stone-800" style={sans}>
                  Oct 2025 – Apr 2026
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#faf8f5] border border-[#A2191B]/10 min-w-[150px]">
              <Users
                className="w-5 h-5 shrink-0"
                style={{ color: "#A2191B" }}
              />
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: "#7a5c5c", ...mono }}
                >
                  Travellers
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ background: "#A2191B" }}
                  >
                    −
                  </button>
                  <span
                    className="text-xs font-bold min-w-[20px] text-center"
                    style={mono}
                  >
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuests(guests + 1)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ background: "#A2191B" }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSearchSubmit}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white hover:scale-105 transition-transform shadow-lg"
              style={{
                background: "linear-gradient(135deg,#A2191B,#FA0301)",
                ...sans,
              }}
            >
              <Search className="w-4 h-4" />
              <span>Search Tours</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Popular Circuits ────────────────────────────────────────────── */}
      <section className="py-20 px-5 lg:px-10 bg-[#f7f2ec]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-7" style={{ background: "#A2191B" }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#A2191B", ...mono }}
                >
                  Featured Destinations
                </span>
              </div>
              <h2
                className="text-3xl md:text-5xl font-bold text-[#1a0a0a]"
                style={serif}
              >
                Iconic India Circuits
              </h2>
            </div>
            <p className="text-stone-500 text-xs max-w-md" style={sans}>
              Explore royal states and serene waters with handpicked 5-star heritage properties.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {popularDestinations.map((dest) => (
              <div
                key={dest.name}
                onClick={() => {
                  setFilter(dest.category);
                  setSearchQuery(dest.name);
                  if (packagesRef.current) {
                    packagesRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white"
                    style={mono}
                  >
                    {dest.tag}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-0.5" style={serif}>
                    {dest.name}
                  </h3>
                  <div className="text-xs text-white/70" style={sans}>
                    {dest.sub}
                  </div>
                  <div
                    className="text-[11px] font-bold text-[#FCBD70] mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    style={mono}
                  >
                    <span>{dest.packagesCount}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Packages Section ────────────────────────────────────────────── */}
      <section ref={packagesRef} id="packages" className="py-24 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-7" style={{ background: "#A2191B" }} />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#A2191B", ...mono }}
                >
                  Handpicked Luxury Holidays
                </span>
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold text-[#1a0a0a]"
                style={{ ...serif, lineHeight: "1.12" }}
              >
                Curated Travel Packages
              </h2>
            </div>
            <div className="text-xs text-stone-500 font-mono">
              Showing {filtered.length} of {activeOnlyPkgs.length} packages
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  filter === f
                    ? "text-white border-transparent shadow-md"
                    : "text-[#7a5c5c] border-[#A2191B]/20 bg-white hover:border-[#A2191B]/50"
                }`}
                style={{
                  background:
                    filter === f
                      ? "linear-gradient(135deg,#A2191B,#FA0301)"
                      : undefined,
                  ...mono,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>

          <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/packages")}
              className="px-8 py-3.5 rounded-full text-xs font-bold text-white shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg,#A2191B,#FA0301)",
                ...sans,
              }}
            >
              <span>Explore All {activeOnlyPkgs.length} Packages & Circuits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/plan-trip")}
              className="px-8 py-3.5 rounded-full text-xs font-bold text-stone-800 bg-white border border-stone-300 hover:border-stone-400 shadow-sm hover:scale-105 transition-transform flex items-center gap-2"
              style={sans}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A2191B]" />
              <span>Design Custom Royal Itinerary</span>
            </button>
          </div>

          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-stone-100 mb-4">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2" style={serif}>
                No Packages Found
              </h3>
              <p className="text-xs text-stone-500 mb-6" style={sans}>
                We couldn't find any packages matching "{searchQuery}" in category "{filter}".
              </p>
              <button
                onClick={() => {
                  setFilter("All");
                  setSearchQuery("");
                }}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md"
                style={{ background: "#A2191B", ...mono }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── The Royal Standards (Why Us) ─────────────────────────────────── */}
      <section className="py-20 px-5 lg:px-10 bg-[#140808] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-3" style={mono}>
              <Award className="w-3.5 h-3.5" />
              THE BOOKMYINDIA PROMISE
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={serif}>
              A Standard Beyond Travel
            </h2>
            <p className="text-white/60 text-sm" style={sans}>
              Every detail is engineered to ensure tranquility, cultural depth, and supreme comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: "Palace & 5-Star Stays",
                desc: "Stay exclusively at Oberoi, Taj, Leela, and restored heritage havelis.",
              },
              {
                icon: ShieldCheck,
                title: "Dedicated Trip Captain",
                desc: "24/7 on-ground concierge managing baggage, check-ins, and fast-track entries.",
              },
              {
                icon: Sparkles,
                title: "Guaranteed Departures",
                desc: "Never worry about cancellations. Once booked, your tour date is 100% locked.",
              },
              {
                icon: CheckCircle2,
                title: "All-Inclusive Transparency",
                desc: "Zero hidden surcharges. All entry tickets, transfers, and taxes included.",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)" }}
                >
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={serif}>
                  {f.title}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed" style={sans}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Numbers Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/10 text-center">
            {[
              { val: "10,000+", label: "Delighted Guests" },
              { val: "500+", label: "Bespoke Itineraries" },
              { val: "100%", label: "Verified Reviews" },
              { val: "4.9 / 5.0", label: "Guest Satisfaction" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ color: "#FCBD70", ...serif }}
                >
                  {val}
                </div>
                <div className="text-white/50 text-xs font-semibold" style={sans}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Traveller Testimonials ───────────────────────────────────────── */}
      <section className="py-24 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-px w-7" style={{ background: "#A2191B" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#A2191B", ...mono }}
              >
                Guest Stories
              </span>
              <div className="h-px w-7" style={{ background: "#A2191B" }} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a0a0a]" style={serif}>
              Memories That Last a Lifetime
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <div>
                  <Quote className="w-8 h-8 text-[#A2191B]/20 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#FCBD70] stroke-[#FCBD70]"
                      />
                    ))}
                  </div>
                  <p
                    className="text-stone-700 text-sm leading-relaxed mb-6 italic"
                    style={serif}
                  >
                    "{t.review}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 text-sm" style={serif}>
                      {t.name}
                    </div>
                    <div className="text-xs text-stone-400" style={sans}>
                      {t.role} · {t.city}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ───────────────────────────────────── */}
      <section className="py-20 px-5 lg:px-10 bg-[#f7f2ec]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
              <HelpCircle className="w-4 h-4 text-[#A2191B]" />
              <span
                className="text-xs font-bold uppercase tracking-widest text-[#A2191B]"
                style={mono}
              >
                Everything You Need to Know
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800" style={serif}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-stone-800 text-sm hover:text-[#A2191B] transition-colors"
                  style={serif}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180 text-[#A2191B]" : "text-stone-400"
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-1 border-t border-stone-100 text-xs text-stone-600 leading-relaxed" style={sans}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
