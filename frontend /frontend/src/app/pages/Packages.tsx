import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Search,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Heart,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  ChevronDown,
  X,
  Check,
  Phone,
  Compass,
  Tag,
  ShieldCheck,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { type Package } from "../data";
import { useStore } from "../store";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

const categoryList = [
  "All",
  "Heritage",
  "Nature",
  "Adventure",
  "Beach",
  "Cultural",
  "Honeymoon",
];

const durationOptions = [
  { id: "all", label: "Any Duration" },
  { id: "short", label: "3 – 5 Days (Quick Escapes)", min: 3, max: 5 },
  { id: "medium", label: "6 – 8 Days (Classic Holidays)", min: 6, max: 8 },
  { id: "long", label: "9+ Days (Grand Expeditions)", min: 9, max: 30 },
];

const priceOptions = [
  { id: "all", label: "Any Budget" },
  { id: "budget", label: "Under ₹20,000", max: 20000 },
  { id: "mid", label: "₹20,000 – ₹30,000", min: 20000, max: 30000 },
  { id: "luxury", label: "₹30,000 & Above", min: 30000 },
];

const sortOptions = [
  { id: "featured", label: "Featured & Bestsellers" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Guest Rating" },
  { id: "duration-asc", label: "Duration: Short to Long" },
  { id: "duration-desc", label: "Duration: Long to Short" },
];

export default function Packages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const { packages: storePackages } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  const toggleLike = (pkgId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [pkgId]: !prev[pkgId] }));
  };

  const activePackages = useMemo(
    () => storePackages.filter((p) => p.active),
    [storePackages]
  );

  // Filter logic
  const filteredPackages = useMemo(() => {
    return activePackages.filter((pkg) => {
      // Category filter
      if (selectedCategory !== "All" && pkg.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = pkg.title.toLowerCase().includes(q);
        const matchesPlaces = pkg.places.toLowerCase().includes(q);
        const matchesCategory = pkg.category.toLowerCase().includes(q);
        const matchesHighlights = pkg.highlights.some((h) =>
          h.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesPlaces && !matchesCategory && !matchesHighlights) {
          return false;
        }
      }

      // Duration filter
      if (selectedDuration === "short" && (pkg.days < 3 || pkg.days > 5)) return false;
      if (selectedDuration === "medium" && (pkg.days < 6 || pkg.days > 8)) return false;
      if (selectedDuration === "long" && pkg.days < 9) return false;

      // Price filter
      if (selectedPrice === "budget" && pkg.price > 20000) return false;
      if (selectedPrice === "mid" && (pkg.price < 20000 || pkg.price > 30000))
        return false;
      if (selectedPrice === "luxury" && pkg.price < 30000) return false;

      // Rating filter
      if (minRating > 0 && pkg.rating < minRating) return false;

      return true;
    });
  }, [
    activePackages,
    selectedCategory,
    search,
    selectedDuration,
    selectedPrice,
    minRating,
  ]);

  // Sort logic
  const sortedPackages = useMemo(() => {
    const list = [...filteredPackages];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "duration-asc":
        return list.sort((a, b) => a.days - b.days);
      case "duration-desc":
        return list.sort((a, b) => b.days - a.days);
      case "featured":
      default:
        return list.sort((a, b) => a.id - b.id);
    }
  }, [filteredPackages, sortBy]);

  const resetAllFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedDuration("all");
    setSelectedPrice("all");
    setMinRating(0);
    setSortBy("featured");
  };

  const activeFiltersCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedDuration !== "all" ? 1 : 0) +
    (selectedPrice !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      <Nav />

      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-[#180707] text-white">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&fit=crop')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(24,7,7,0.85) 0%, rgba(24,7,7,0.98) 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-3" style={sans}>
            <button
              onClick={() => navigate("/")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#FCBD70]">Tour Packages</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8" style={{ background: "#FCBD70" }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#FCBD70", ...mono }}
                >
                  Curated Royal Holidays
                </span>
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
                style={serif}
              >
                Explore All Tour Packages
              </h1>
              <p
                className="text-white/70 text-sm mt-2 max-w-2xl font-light"
                style={sans}
              >
                From majestic Rajasthani havelis to emerald Kerala backwaters and high-altitude Himalayan passes — discover handpicked 5-star itineraries with private chauffeurs.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate("/plan-trip")}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-[#180707] transition-all hover:scale-105 shadow-md"
                style={{ background: "#FCBD70", ...sans }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Plan Custom Trip
              </button>
            </div>
          </div>

          {/* Search bar inside hero */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/15 flex flex-col sm:flex-row gap-2 max-w-3xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 text-white">
              <Search className="w-4 h-4 text-[#FCBD70] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by circuit, destination, or attraction (e.g. Taj Mahal, Munnar, Leh)..."
                className="w-full bg-transparent text-sm placeholder:text-white/50 text-white outline-none"
                style={sans}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="p-1 rounded-full hover:bg-white/20 text-white/70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pt-6 pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                  selectedCategory === cat
                    ? "bg-[#A2191B] text-white border-[#A2191B] shadow-md"
                    : "bg-white/5 text-white/80 border-white/15 hover:bg-white/15"
                }`}
                style={sans}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Content & Filter Bar ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
        {/* Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-stone-900" style={serif}>
              Showing {sortedPackages.length}{" "}
              {sortedPackages.length === 1 ? "Package" : "Packages"}
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#A2191B] hover:underline"
                style={sans}
              >
                <X className="w-3 h-3" />
                Reset ({activeFiltersCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-xs">
              <span className="text-xs text-stone-400 mr-2" style={mono}>
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold text-stone-700 bg-transparent outline-none cursor-pointer pr-4"
                style={sans}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-stone-900 text-white"
                    : "text-stone-400 hover:text-stone-800"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-stone-900 text-white"
                    : "text-stone-400 hover:text-stone-800"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-xs"
              style={sans}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#A2191B] text-white text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Layout Grid: Sidebar + Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters Desktop */}
          <div className="hidden lg:flex flex-col gap-6 sticky top-24 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm" style={serif}>
                <SlidersHorizontal className="w-4 h-4 text-[#A2191B]" />
                Filter Tours
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-[#A2191B] font-semibold hover:underline"
                  style={sans}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Duration Filter */}
            <div>
              <label
                className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-3"
                style={mono}
              >
                Trip Duration
              </label>
              <div className="flex flex-col gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDuration(opt.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                      selectedDuration === opt.id
                        ? "bg-[#fff4e6] text-[#A2191B] font-bold border border-[#A2191B]/20"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                    style={sans}
                  >
                    <span>{opt.label}</span>
                    {selectedDuration === opt.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label
                className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-3"
                style={mono}
              >
                Price Per Person
              </label>
              <div className="flex flex-col gap-2">
                {priceOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPrice(opt.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                      selectedPrice === opt.id
                        ? "bg-[#fff4e6] text-[#A2191B] font-bold border border-[#A2191B]/20"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                    style={sans}
                  >
                    <span>{opt.label}</span>
                    {selectedPrice === opt.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label
                className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-3"
                style={mono}
              >
                Guest Rating
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: 0, label: "All Ratings" },
                  { value: 4.8, label: "4.8 & Above ★★★★★" },
                  { value: 4.5, label: "4.5 & Above ★★★★" },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setMinRating(r.value)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                      minRating === r.value
                        ? "bg-[#fff4e6] text-[#A2191B] font-bold border border-[#A2191B]/20"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                    style={sans}
                  >
                    <span>{r.label}</span>
                    {minRating === r.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Concierge Assistance Mini Banner */}
            <div className="mt-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1a7a3c]" />
                <span className="text-xs font-bold text-stone-800" style={serif}>
                  100% Tailorable
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed mb-3" style={sans}>
                Want custom dates, extra nights, or private helicopter transfers?
              </p>
              <button
                onClick={() => navigate("/plan-trip")}
                className="w-full py-2 rounded-xl text-xs font-bold text-[#A2191B] border border-[#A2191B]/30 hover:bg-[#A2191B] hover:text-white transition-all text-center"
                style={sans}
              >
                Request Custom Itinerary
              </button>
            </div>
          </div>

          {/* Package Listing Area */}
          <div className="lg:col-span-3">
            {sortedPackages.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center mb-4 text-[#A2191B]">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2" style={serif}>
                  No Tour Packages Found
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mb-6" style={sans}>
                  We could not find any tours matching your active search and filter criteria. Try adjusting your duration, category, or budget filters.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
                    style={{
                      background: "linear-gradient(135deg,#A2191B,#FA0301)",
                      ...sans,
                    }}
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => navigate("/plan-trip")}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-stone-700 border border-stone-300 hover:border-stone-400 bg-white"
                    style={sans}
                  >
                    Build Custom Itinerary
                  </button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {sortedPackages.map((pkg) => {
                  const discount = Math.round(
                    ((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100
                  );
                  const isLiked = likedMap[pkg.id] || false;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => navigate(`/package/${pkg.id}`)}
                      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-stone-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col cursor-pointer shadow-xs"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-64 overflow-hidden bg-[#f5f0eb]">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        <div
                          className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                          style={{
                            background: pkg.badgeColor || "#A2191B",
                            ...mono,
                          }}
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
                          onClick={(e) => toggleLike(pkg.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                        >
                          <Heart
                            className="w-4 h-4 transition-colors"
                            fill={isLiked ? "#FA0301" : "none"}
                            stroke={isLiked ? "#FA0301" : "#7a5c5c"}
                            strokeWidth={2}
                          />
                        </button>

                        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-[#FCBD70]" />
                          <span className="text-white text-xs font-medium" style={sans}>
                            {pkg.duration}
                          </span>
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className="text-[11px] font-bold uppercase tracking-widest text-[#A2191B]"
                            style={mono}
                          >
                            {pkg.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#FCBD70] stroke-[#FCBD70]" />
                            <span
                              className="text-xs font-bold text-stone-800"
                              style={mono}
                            >
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
                          <span
                            className="text-xs text-[#7a5c5c] line-clamp-1"
                            style={sans}
                          >
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
                            <div
                              className="text-xs text-[#7a5c5c] line-through"
                              style={sans}
                            >
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
                              background:
                                "linear-gradient(135deg,#A2191B,#FA0301)",
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
                })}
              </div>
            ) : (
              /* Detailed List View */
              <div className="flex flex-col gap-5">
                {sortedPackages.map((pkg) => {
                  const discount = Math.round(
                    ((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100
                  );
                  const isLiked = likedMap[pkg.id] || false;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => navigate(`/package/${pkg.id}`)}
                      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-stone-300 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row cursor-pointer shadow-xs"
                    >
                      {/* Image */}
                      <div className="relative md:w-72 h-56 md:h-auto overflow-hidden bg-[#f5f0eb] shrink-0">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div
                          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                          style={{
                            background: pkg.badgeColor || "#A2191B",
                            ...mono,
                          }}
                        >
                          {pkg.badge}
                        </div>
                        <button
                          onClick={(e) => toggleLike(pkg.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={isLiked ? "#FA0301" : "none"}
                            stroke={isLiked ? "#FA0301" : "#7a5c5c"}
                            strokeWidth={2}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span
                              className="text-[11px] font-bold uppercase tracking-widest text-[#A2191B]"
                              style={mono}
                            >
                              {pkg.category} · {pkg.duration}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-[#FCBD70] stroke-[#FCBD70]" />
                              <span
                                className="text-xs font-bold text-stone-800"
                                style={mono}
                              >
                                {pkg.rating}
                              </span>
                              <span className="text-xs text-stone-400" style={sans}>
                                ({pkg.reviews} reviews)
                              </span>
                            </div>
                          </div>

                          <h3
                            className="font-bold text-[#1a0a0a] text-xl mb-2 group-hover:text-[#A2191B] transition-colors"
                            style={serif}
                          >
                            {pkg.title}
                          </h3>

                          <div className="flex items-center gap-1.5 mb-3 text-xs text-stone-500" style={sans}>
                            <MapPin className="w-3.5 h-3.5 text-[#A2191B] shrink-0" />
                            <span>{pkg.places}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {pkg.highlights.map((h) => (
                              <span
                                key={h}
                                className="text-[11px] px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 bg-stone-50"
                                style={sans}
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <div className="text-xs text-stone-400 line-through" style={sans}>
                              ₹{pkg.originalPrice.toLocaleString()}
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-[#A2191B]" style={serif}>
                                ₹{pkg.price.toLocaleString()}
                              </span>
                              <span className="text-xs text-stone-500" style={sans}>
                                / person + taxes
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/checkout`, {
                                  state: {
                                    packageId: pkg.id,
                                    travelDate: "15 Oct 2025",
                                    guests: 2,
                                    pricePerPerson: pkg.price,
                                  },
                                });
                              }}
                              className="px-4 py-2.5 rounded-full text-xs font-bold text-[#A2191B] border border-[#A2191B]/30 hover:bg-[#A2191B]/5 transition-colors"
                              style={sans}
                            >
                              Quick Book
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/package/${pkg.id}`);
                              }}
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
                              style={{
                                background: "linear-gradient(135deg,#A2191B,#FA0301)",
                                ...sans,
                              }}
                            >
                              <span>View Full Itinerary</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom Concierge Banner ────────────────────────────────────────── */}
        <div className="mt-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A2191B] uppercase tracking-widest mb-1" style={mono}>
                <Sparkles className="w-3.5 h-3.5" />
                Bespoke Travel Designers
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2" style={serif}>
                Can’t find the exact itinerary you have in mind?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed" style={sans}>
                Our luxury travel curators craft 100% personalized itineraries — private helicopters, heritage palace dinners, and dedicated trip captains tailored for you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/plan-trip")}
                className="px-6 py-3 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
                style={{
                  background: "linear-gradient(135deg,#A2191B,#FA0301)",
                  ...sans,
                }}
              >
                Launch Custom Trip Planner
              </button>
              <a
                href="tel:+911800123456"
                className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-stone-700 border border-stone-300 hover:border-stone-400 bg-white"
                style={sans}
              >
                <Phone className="w-3.5 h-3.5 text-[#A2191B]" />
                Call Concierge: 1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
