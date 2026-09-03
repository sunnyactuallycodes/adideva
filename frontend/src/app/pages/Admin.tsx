import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package as PackageIcon,
  ShoppingBag,
  Users,
  LogOut,
  Plus,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Edit3,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  MapPin,
  Filter,
  Menu,
  Trash2,
  UploadCloud,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useStore } from "../store";
import { useAuth } from "../context/AuthContext";
import { mockUsers, type Package as Pkg, type Order, type User } from "../data";
import { api } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

type AdminTab = "dashboard" | "packages" | "orders" | "users";

const STATUS_COLORS: Record<
  Order["status"],
  { bg: string; text: string; label: string }
> = {
  confirmed: { bg: "#e6f4ec", text: "#1a7a3c", label: "Confirmed" },
  pending: { bg: "#fff8e6", text: "#8B6914", label: "Pending" },
  cancelled: { bg: "#fde8e8", text: "#b91c1c", label: "Cancelled" },
  completed: { bg: "#e8f0fe", text: "#1a5c8a", label: "Completed" },
};

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + "18" }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1"
          style={mono}
        >
          {label}
        </div>
        <div className="text-2xl font-bold text-stone-800" style={serif}>
          {value}
        </div>
        <div className="text-xs text-stone-400 mt-0.5" style={sans}>
          {sub}
        </div>
      </div>
    </div>
  );
}

// ─── Package Form Modal Component ─────────────────────────────────────────────

const emptyPkg: Omit<Pkg, "id"> = {
  title: "",
  places: "",
  duration: "7 Days / 6 Nights",
  days: 7,
  nights: 6,
  overview: "",
  price: 19999,
  pricing: {
    double: 19999,
    triple: 17999,
    quad: 15999,
  },
  originalPrice: 25000,
  rating: 4.8,
  reviews: 0,
  badge: "Featured",
  badgeColor: "#A2191B",
  image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=460&fit=crop&auto=format",
  category: "Heritage",
  highlights: ["5-Star Palace Stay", "Private AC Chauffeur", "Certified Heritage Guide", "All Monument Admissions"],
  maxGuests: 16,
  active: true,
  pickupLocation: "IGI Airport, New Delhi",
  dropLocation: "Airport / Railway Station",
  bestSeason: "Oct – Mar",
  departureDates: ["15 Mar 2026", "22 Mar 2026", "05 Apr 2026", "19 Apr 2026", "10 May 2026", "24 May 2026"],
  itinerary: [
    {
      day: 1,
      title: "Arrival & Royal Welcome",
      location: "Delhi",
      hotel: "The Imperial New Delhi ★★★★★",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=700&fit=crop",
      meals: ["Dinner"],
      description: "Arrive at the airport where your dedicated chauffeur welcomes you with a luxury transfer to your 5-star hotel. Evening welcome dinner featuring curated authentic cuisine.",
      highlights: ["Luxury Airport Chauffeur", "Check-in at 5-Star Hotel", "Royal Welcome Dinner"],
    },
    {
      day: 2,
      title: "Heritage Monuments & Bazaars",
      location: "Delhi",
      hotel: "The Imperial New Delhi ★★★★★",
      image: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=700&fit=crop",
      meals: ["Breakfast", "Lunch"],
      description: "Morning guided walk through the historic quarters, visiting UNESCO World Heritage sites followed by an exclusive rickshaw ride through bustling old town markets.",
      highlights: ["UNESCO Monuments Tour", "Old Town Rickshaw Walk", "Culinary Tasting"],
    },
  ],
  inclusions: [
    "5-star hotel luxury accommodations",
    "Daily breakfast and meals as indicated in itinerary",
    "Private luxury AC vehicle with dedicated chauffeur",
    "English-speaking certified ASI local guides",
    "All monument entry tickets & experience passes",
  ],
  exclusions: [
    "Domestic & International airfare or train tickets",
    "Personal expenses, room service, and tips",
    "Optional adventure activities not specified",
  ],
  thingsToCarry: [
    { icon: "🪪", item: "Govt. Photo ID (Aadhar / Passport)", critical: true },
    { icon: "💊", item: "Personal medications & first aid kit", critical: true },
    { icon: "👟", item: "Comfortable walking / trek shoes", critical: true },
    { icon: "🧴", item: "Sunscreen SPF 50+ & Sunglasses", critical: false },
    { icon: "📷", item: "Camera / Extra memory card", critical: false },
  ],
};

function PackageModal({
  pkg,
  onSave,
  onClose,
}: {
  pkg: Omit<Pkg, "id"> | Pkg;
  onSave: (p: any) => void;
  onClose: () => void;
}) {
  const [modalTab, setModalTab] = useState<"basics" | "pricing" | "overview" | "itinerary" | "inclusions">("basics");
  const [form, setForm] = useState<any>(() => {
    const base = { ...emptyPkg, ...pkg };
    return {
      ...base,
      pricing: {
        double: base.pricing?.double || base.price || 19999,
        triple: base.pricing?.triple || Math.round((base.price || 19999) * 0.9),
        quad: base.pricing?.quad || Math.round((base.price || 19999) * 0.8),
      },
      itinerary: (base.itinerary && base.itinerary.length > 0) ? base.itinerary : emptyPkg.itinerary,
      highlights: (base.highlights && base.highlights.length > 0) ? base.highlights : emptyPkg.highlights,
      inclusions: (base.inclusions && base.inclusions.length > 0) ? base.inclusions : emptyPkg.inclusions,
      exclusions: (base.exclusions && base.exclusions.length > 0) ? base.exclusions : emptyPkg.exclusions,
      thingsToCarry: (base.thingsToCarry && base.thingsToCarry.length > 0) ? base.thingsToCarry : emptyPkg.thingsToCarry,
      departureDates: (base.departureDates && base.departureDates.length > 0) ? base.departureDates : emptyPkg.departureDates,
    };
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newDateInput, setNewDateInput] = useState("");
  const [newHighlightInput, setNewHighlightInput] = useState("");
  const [newInclusionInput, setNewInclusionInput] = useState("");
  const [newExclusionInput, setNewExclusionInput] = useState("");
  const [newCarryItem, setNewCarryItem] = useState({ icon: "🎒", item: "", critical: false });

  const isEdit = "id" in pkg && Boolean((pkg as any).id);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handlePriceChange = (k: "double" | "triple" | "quad", val: number) => {
    setForm((f: any) => {
      const newPricing = { ...f.pricing, [k]: val };
      return {
        ...f,
        pricing: newPricing,
        price: k === "double" ? val : f.price,
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      set("image", previewUrl);
    }
  };

  // Itinerary Day operations
  const handleAddDay = () => {
    const nextDayNum = (form.itinerary?.length || 0) + 1;
    const newDay = {
      day: nextDayNum,
      title: `Day ${nextDayNum} — Exploration & Experiences`,
      location: form.places.split("·")[0]?.trim() || "",
      hotel: "Luxury Heritage Resort ★★★★★",
      image: form.image || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&fit=crop",
      meals: ["Breakfast", "Dinner"],
      description: "Morning guided excursion followed by local sightseeing and evening cultural entertainment.",
      highlights: ["Guided Excursion", "Heritage Walk"],
    };
    const updatedItin = [...(form.itinerary || []), newDay];
    set("itinerary", updatedItin);
    set("days", updatedItin.length);
    set("nights", Math.max(1, updatedItin.length - 1));
    set("duration", `${updatedItin.length} Days / ${Math.max(1, updatedItin.length - 1)} Nights`);
  };

  const handleRemoveDay = (index: number) => {
    const filtered = form.itinerary.filter((_: any, i: number) => i !== index);
    const resequenced = filtered.map((d: any, i: number) => ({ ...d, day: i + 1 }));
    set("itinerary", resequenced);
    set("days", resequenced.length);
    set("nights", Math.max(1, resequenced.length - 1));
    set("duration", `${resequenced.length} Days / ${Math.max(1, resequenced.length - 1)} Nights`);
  };

  const handleUpdateDay = (index: number, key: string, value: any) => {
    const updated = [...form.itinerary];
    updated[index] = { ...updated[index], [key]: value };
    set("itinerary", updated);
  };

  const handleSave = () => {
    if (!form.title || !form.places || !form.price) {
      alert("Please fill in package title, places/circuit, and base price.");
      return;
    }
    onSave({
      ...form,
      highlights: form.highlights.filter(Boolean),
      imageFile,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)" }}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#faf8f5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#A2191B" }} />
              <h3 className="font-bold text-stone-800 text-lg sm:text-xl" style={serif}>
                {isEdit ? `Edit Package: ${form.title || "Tour"}` : "Create New Bespoke Package"}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5" style={sans}>
              Manage "Why This Tour", room sharing rates, day-wise plan, and packing essentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-200/60 hover:bg-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-stone-700" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-6 overflow-x-auto gap-1" style={{ scrollbarWidth: "none" }}>
          {[
            { id: "basics", label: "1. Basics & Cover" },
            { id: "pricing", label: "2. Sharing Rates & Dates" },
            { id: "overview", label: "3. 'Why This Tour?'" },
            { id: "itinerary", label: `4. Day-Wise Plan (${form.itinerary?.length || 0} Days)` },
            { id: "inclusions", label: "5. Inclusions & Packing" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setModalTab(t.id as any)}
              className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                modalTab === t.id
                  ? "border-[#A2191B] text-[#A2191B]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
              style={mono}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto p-6 flex-1 flex flex-col gap-6" style={{ scrollbarWidth: "none" }}>
          {/* TAB 1: BASICS */}
          {modalTab === "basics" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Package Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Golden Triangle Heritage & Palaces"
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                  style={sans}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Places / Circuit *
                </label>
                <input
                  type="text"
                  value={form.places}
                  onChange={(e) => set("places", e.target.value)}
                  placeholder="e.g. Delhi · Agra · Jaipur"
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                  style={sans}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B] bg-white"
                  style={sans}
                >
                  {["Heritage", "Nature", "Adventure", "Beach", "Cultural", "Honeymoon", "Wildlife", "Spiritual"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Duration String
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  placeholder="7 Days / 6 Nights"
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                  style={sans}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                    Days
                  </label>
                  <input
                    type="number"
                    value={form.days}
                    onChange={(e) => set("days", Number(e.target.value))}
                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                    Nights
                  </label>
                  <input
                    type="number"
                    value={form.nights}
                    onChange={(e) => set("nights", Number(e.target.value))}
                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Badge Text
                </label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(e) => set("badge", e.target.value)}
                  placeholder="Bestseller / Top Rated / Luxury Special"
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                  style={sans}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Badge Accent Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.badgeColor}
                    onChange={(e) => set("badgeColor", e.target.value)}
                    className="w-10 h-10 rounded-xl border border-stone-200 cursor-pointer"
                  />
                  <span className="text-xs text-stone-600 font-mono">{form.badgeColor}</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => set("image", e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                  style={sans}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Or Upload Cover Photo to Cloudinary
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#A2191B] cursor-pointer text-xs font-bold text-stone-700 transition-colors bg-stone-50">
                  <UploadCloud className="w-4 h-4 text-[#A2191B]" />
                  <span>Select Image from Computer</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imageFile && (
                  <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1" style={sans}>
                    <Check className="w-3.5 h-3.5" /> Selected: {imageFile.name}
                  </p>
                )}
              </div>

              {form.image && (
                <div className="sm:col-span-2">
                  <div className="h-40 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      Cover Photo Preview
                    </span>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => set("active", !form.active)}
                  className="flex items-center gap-3 text-sm font-semibold"
                  style={sans}
                >
                  {form.active ? <ToggleRight className="w-7 h-7 text-emerald-600" /> : <ToggleLeft className="w-7 h-7 text-stone-400" />}
                  <span className={form.active ? "text-emerald-700" : "text-stone-500"}>
                    {form.active ? "Package is Live & Published on Main Website" : "Package is Saved as Inactive Draft"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & LOGISTICS */}
          {modalTab === "pricing" && (
            <div className="flex flex-col gap-5">
              <div className="bg-[#fdf5f0] border border-[#A2191B]/15 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-[#A2191B] mb-1" style={serif}>
                  Room Sharing Rate Breakdown (per person)
                </h4>
                <p className="text-xs text-stone-600 mb-4" style={sans}>
                  Configure exact per-person rates for Double, Triple, and Quad occupancy. When guests choose room counters, these prices calculate dynamically.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                    <label className="text-xs font-bold text-stone-700 block mb-1" style={sans}>
                      Double Sharing (₹) *
                    </label>
                    <input
                      type="number"
                      value={form.pricing?.double || form.price}
                      onChange={(e) => handlePriceChange("double", Number(e.target.value))}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-base font-bold text-[#A2191B] outline-none"
                      style={mono}
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">2 persons per room</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                    <label className="text-xs font-bold text-stone-700 block mb-1" style={sans}>
                      Triple Sharing (₹) *
                    </label>
                    <input
                      type="number"
                      value={form.pricing?.triple || Math.round(form.price * 0.9)}
                      onChange={(e) => handlePriceChange("triple", Number(e.target.value))}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-base font-bold text-[#8B6914] outline-none"
                      style={mono}
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">3 persons per room</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                    <label className="text-xs font-bold text-stone-700 block mb-1" style={sans}>
                      Quad Sharing (₹) *
                    </label>
                    <input
                      type="number"
                      value={form.pricing?.quad || Math.round(form.price * 0.8)}
                      onChange={(e) => handlePriceChange("quad", Number(e.target.value))}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-base font-bold text-[#1a5c8a] outline-none"
                      style={mono}
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">4 persons per room</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                    Original Reference Price (₹) (Strikethrough)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => set("originalPrice", Number(e.target.value))}
                    placeholder="28000"
                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                    Max Group Guests
                  </label>
                  <input
                    type="number"
                    value={form.maxGuests}
                    onChange={(e) => set("maxGuests", Number(e.target.value))}
                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={form.pickupLocation || ""}
                    onChange={(e) => set("pickupLocation", e.target.value)}
                    placeholder="e.g. IGI Airport, New Delhi"
                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                    Drop Location
                  </label>
                  <input
                    type="text"
                    value={form.dropLocation || ""}
                    onChange={(e) => set("dropLocation", e.target.value)}
                    placeholder="e.g. Jaipur Airport / Railway Station"
                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                    Best Season to Visit
                  </label>
                  <input
                    type="text"
                    value={form.bestSeason || ""}
                    onChange={(e) => set("bestSeason", e.target.value)}
                    placeholder="e.g. October to March"
                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                </div>
              </div>

              {/* Departure Dates */}
              <div className="border border-stone-200 rounded-2xl p-4">
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-600 block mb-2" style={mono}>
                  Departure Dates Schedule
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.departureDates?.map((date: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-semibold text-stone-700"
                    >
                      {date}
                      <button
                        type="button"
                        onClick={() => set("departureDates", form.departureDates.filter((_: any, idx: number) => idx !== i))}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    placeholder="e.g. 12 Oct 2026"
                    className="flex-1 border-2 border-stone-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDateInput.trim()) {
                        set("departureDates", [...(form.departureDates || []), newDateInput.trim()]);
                        setNewDateInput("");
                      }
                    }}
                    className="px-4 py-2 bg-[#A2191B] text-white text-xs font-bold rounded-xl"
                  >
                    Add Date
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHY THIS TOUR & HIGHLIGHTS */}
          {modalTab === "overview" && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-1.5" style={mono}>
                  "Why This Tour?" Package Story & Overview *
                </label>
                <p className="text-xs text-stone-400 mb-2" style={sans}>
                  Write the compelling narrative for this tour shown directly on the Package Detail page.
                </p>
                <textarea
                  rows={6}
                  value={form.overview || ""}
                  onChange={(e) => set("overview", e.target.value)}
                  placeholder="The Golden Triangle is India's most iconic travel circuit — a millennia of empire, art, and architecture compressed into three extraordinary cities. Every hotel, guide, meal, and timing is refined to ensure you experience each destination at its most magical..."
                  className="w-full border-2 border-stone-200 rounded-2xl p-4 text-sm outline-none focus:border-[#A2191B] leading-relaxed"
                  style={sans}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-2" style={mono}>
                  Key Highlights & Signature Experiences
                </label>
                <div className="flex flex-col gap-2 mb-3">
                  {form.highlights?.map((h: string, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full bg-[#fff4e6] text-[#A2191B] flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const updated = [...form.highlights];
                          updated[i] = e.target.value;
                          set("highlights", updated);
                        }}
                        className="flex-1 border-2 border-stone-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#A2191B]"
                        style={sans}
                      />
                      <button
                        type="button"
                        onClick={() => set("highlights", form.highlights.filter((_: any, idx: number) => idx !== i))}
                        className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    placeholder="e.g. Sunrise Taj Mahal Guided Tour with ASI Historian"
                    className="flex-1 border-2 border-stone-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#A2191B]"
                    style={sans}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newHighlightInput.trim()) {
                        set("highlights", [...(form.highlights || []), newHighlightInput.trim()]);
                        setNewHighlightInput("");
                      }
                    }}
                    className="px-4 py-2 bg-[#A2191B] text-white text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Highlight
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DAY-WISE PLAN */}
          {modalTab === "itinerary" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <h4 className="text-sm font-bold text-stone-800" style={serif}>
                    Day-Wise Itinerary Plan
                  </h4>
                  <p className="text-xs text-stone-500" style={sans}>
                    Currently {form.itinerary?.length || 0} Days configured. Click "+ Add New Day" to append new days.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-4 py-2.5 bg-[#A2191B] hover:bg-[#801416] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  style={sans}
                >
                  <Plus className="w-4 h-4" /> Add Day { (form.itinerary?.length || 0) + 1 }
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {form.itinerary?.map((day: any, i: number) => (
                  <div key={i} className="border-2 border-stone-200 rounded-2xl p-4 bg-white hover:border-[#A2191B]/30 transition-all flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-[#A2191B] text-white font-bold flex items-center justify-center text-xs" style={serif}>
                          D{day.day}
                        </span>
                        <span className="font-bold text-stone-800 text-sm" style={serif}>
                          Day {day.day} Details
                        </span>
                      </div>
                      {form.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(i)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Day
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase block mb-1" style={mono}>
                          Day Title *
                        </label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleUpdateDay(i, "title", e.target.value)}
                          placeholder="e.g. Arrival in Delhi — City of Empires"
                          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#A2191B]"
                          style={sans}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-500 uppercase block mb-1" style={mono}>
                          City / Location
                        </label>
                        <input
                          type="text"
                          value={day.location || ""}
                          onChange={(e) => handleUpdateDay(i, "location", e.target.value)}
                          placeholder="e.g. Delhi → Agra"
                          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#A2191B]"
                          style={sans}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-500 uppercase block mb-1" style={mono}>
                          Hotel / Resort
                        </label>
                        <input
                          type="text"
                          value={day.hotel || ""}
                          onChange={(e) => handleUpdateDay(i, "hotel", e.target.value)}
                          placeholder="e.g. Oberoi Amarvilas ★★★★★"
                          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#A2191B]"
                          style={sans}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase block mb-1" style={mono}>
                          Day Image URL
                        </label>
                        <input
                          type="text"
                          value={day.image || ""}
                          onChange={(e) => handleUpdateDay(i, "image", e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#A2191B]"
                          style={sans}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase block mb-1" style={mono}>
                          Day Narrative & Experience Details
                        </label>
                        <textarea
                          rows={3}
                          value={day.description || ""}
                          onChange={(e) => handleUpdateDay(i, "description", e.target.value)}
                          placeholder="Describe the day's journey, monuments visited, guides, and dinner experiences..."
                          className="w-full border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#A2191B] leading-relaxed"
                          style={sans}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Add Day Button */}
              <button
                type="button"
                onClick={handleAddDay}
                className="w-full py-3.5 border-2 border-dashed border-[#A2191B]/40 hover:border-[#A2191B] rounded-2xl text-xs font-bold text-[#A2191B] flex items-center justify-center gap-2 hover:bg-[#fff4e6] transition-colors"
                style={sans}
              >
                <Plus className="w-4 h-4" /> Add Day { (form.itinerary?.length || 0) + 1 } to Itinerary
              </button>
            </div>
          )}

          {/* TAB 5: INCLUSIONS & PACKING */}
          {modalTab === "inclusions" && (
            <div className="flex flex-col gap-5">
              {/* Inclusions */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-stone-800" style={serif}>
                    Inclusions (What's Included)
                  </h4>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {form.inclusions?.map((inc: string, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={inc}
                        onChange={(e) => {
                          const updated = [...form.inclusions];
                          updated[i] = e.target.value;
                          set("inclusions", updated);
                        }}
                        className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-600"
                        style={sans}
                      />
                      <button
                        type="button"
                        onClick={() => set("inclusions", form.inclusions.filter((_: any, idx: number) => idx !== i))}
                        className="p-1.5 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInclusionInput}
                    onChange={(e) => setNewInclusionInput(e.target.value)}
                    placeholder="e.g. Daily gourmet breakfast at 5-star palace"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-600"
                    style={sans}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInclusionInput.trim()) {
                        set("inclusions", [...(form.inclusions || []), newInclusionInput.trim()]);
                        setNewInclusionInput("");
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                  >
                    Add Included
                  </button>
                </div>
              </div>

              {/* Exclusions */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <X className="w-4 h-4 text-red-600" />
                  <h4 className="text-sm font-bold text-stone-800" style={serif}>
                    Exclusions (Not Included)
                  </h4>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {form.exclusions?.map((exc: string, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={exc}
                        onChange={(e) => {
                          const updated = [...form.exclusions];
                          updated[i] = e.target.value;
                          set("exclusions", updated);
                        }}
                        className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-600"
                        style={sans}
                      />
                      <button
                        type="button"
                        onClick={() => set("exclusions", form.exclusions.filter((_: any, idx: number) => idx !== i))}
                        className="p-1.5 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExclusionInput}
                    onChange={(e) => setNewExclusionInput(e.target.value)}
                    placeholder="e.g. Flight tickets to New Delhi"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-600"
                    style={sans}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newExclusionInput.trim()) {
                        set("exclusions", [...(form.exclusions || []), newExclusionInput.trim()]);
                        setNewExclusionInput("");
                      }
                    }}
                    className="px-3.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                  >
                    Add Excluded
                  </button>
                </div>
              </div>

              {/* Things to Carry */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🎒</span>
                  <h4 className="text-sm font-bold text-stone-800" style={serif}>
                    Things to Carry / Packing Guide
                  </h4>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {form.thingsToCarry?.map((tc: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center bg-stone-50 p-2 rounded-xl">
                      <span className="text-lg">{tc.icon}</span>
                      <span className="text-xs font-medium text-stone-800 flex-1">{tc.item}</span>
                      {tc.critical && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                          Critical
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => set("thingsToCarry", form.thingsToCarry.filter((_: any, idx: number) => idx !== i))}
                        className="p-1 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newCarryItem.icon}
                    onChange={(e) => setNewCarryItem((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="Icon (e.g. 📷)"
                    className="border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none"
                    style={sans}
                  />
                  <input
                    type="text"
                    value={newCarryItem.item}
                    onChange={(e) => setNewCarryItem((prev) => ({ ...prev, item: e.target.value }))}
                    placeholder="Item description (e.g. Sunscreen SPF 50+)"
                    className="sm:col-span-2 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none"
                    style={sans}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCarryItem.item.trim()) {
                        set("thingsToCarry", [...(form.thingsToCarry || []), { ...newCarryItem }]);
                        setNewCarryItem({ icon: "🎒", item: "", critical: false });
                      }
                    }}
                    className="px-3.5 py-2 bg-stone-800 text-white text-xs font-bold rounded-xl"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex gap-3 px-6 py-4 border-t border-stone-100 bg-[#faf8f5]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            style={sans}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white transition-all hover:opacity-95 shadow-md flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg,#A2191B,#FA0301)",
              ...sans,
            }}
          >
            <Check className="w-4 h-4" />
            <span>{isEdit ? "Save & Publish Changes" : "Create & Launch Package"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Panel Page ────────────────────────────────────────────────────

export default function Admin() {
  const navigate = useNavigate();
  const {
    packages,
    orders,
    addPackage,
    updatePackage,
    deletePackage,
    togglePackageActive,
    updateOrderStatus,
    refreshPackages,
    refreshOrders,
  } = useStore();

  const { isAdmin, login } = useAuth();

  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pkgSearch, setPkgSearch] = useState("");
  const [pkgCategoryFilter, setPkgCategoryFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Pkg | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Backend users list
  const [usersList, setUsersList] = useState<User[]>(mockUsers);
  const [backendStats, setBackendStats] = useState<any>(null);

  // Auth Gate
  const [authed, setAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setAuthed(true);
    }
  }, [isAdmin]);

  // Load backend users and stats if connected
  useEffect(() => {
    if (authed) {
      api.users.getAllUsers().then((res) => {
        if (res.success && res.data?.users && res.data.users.length > 0) {
          setUsersList(res.data.users);
        }
      });
      api.users.getAdminStats().then((res) => {
        if (res.success && res.data) {
          setBackendStats(res.data);
        }
      });
    }
  }, [authed]);

  const handleAuth = async () => {
    setAuthError("");
    if (adminPass === "12345678") {
      setAuthed(true);
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await login("adideva@gmail.com", adminPass);
      if (res.success) {
        setAuthed(true);
      } else {
        setAuthError(res.error || "Incorrect admin password.");
      }
    } catch {
      setAuthError("Authentication failed. Please verify credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg,#1a0a0a 0%,#3a1010 100%)" }}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-stone-200 animate-in fade-in zoom-in-95">
          <div className="flex flex-col items-center mb-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)" }}
            >
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800" style={serif}>
              BookMyIndia Admin Panel
            </h1>
            <p className="text-stone-400 text-xs mt-1" style={sans}>
              Package Management · Order Analytics · User Database
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-widest text-stone-400 block mb-1.5"
                style={mono}
              >
                Admin Access Key
              </label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Enter admin password"
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#A2191B] transition-colors"
                style={sans}
              />
              {authError && (
                <p className="text-red-500 text-xs mt-1.5 font-medium" style={sans}>
                  {authError}
                </p>
              )}
            </div>

            <button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 transition-all hover:opacity-95 shadow-md flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#A2191B,#FA0301)",
                ...sans,
              }}
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Admin Console</span>
                  <span>→</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/")}
              className="text-center text-xs text-stone-400 hover:text-stone-700 mt-2 transition-colors"
              style={sans}
            >
              ← Return to Main Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Calculated Metrics ──
  const totalRevenue =
    backendStats?.totalRevenue ?? orders.reduce((s, o) => s + (o.total || 0), 0);
  const confirmedOrders =
    backendStats?.confirmedOrders ??
    orders.filter((o) => o.status === "confirmed").length;
  const activePackages =
    backendStats?.activePackages ?? packages.filter((p) => p.active).length;
  const totalGuests =
    backendStats?.totalGuests ?? orders.reduce((s, o) => s + (o.guests || 1), 0);
  const totalUsersCount = backendStats?.totalUsers ?? usersList.length;

  // ── Filters ──
  const filteredPkgs = packages.filter((p) => {
    const matchSearch =
      !pkgSearch ||
      p.title.toLowerCase().includes(pkgSearch.toLowerCase()) ||
      p.places.toLowerCase().includes(pkgSearch.toLowerCase());
    const matchCategory =
      pkgCategoryFilter === "all" || p.category === pkgCategoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !orderSearch ||
      o.packageTitle?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.traveller?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.traveller?.email?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus =
      orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredUsers = usersList.filter(
    (u) =>
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const handleSavePkg = async (p: any) => {
    if (editingPkg) {
      await updatePackage({ ...p, id: editingPkg.id });
    } else {
      await addPackage(p);
    }
    setShowPkgModal(false);
    setEditingPkg(null);
  };

  const handleToggleUserStatus = async (userObj: User) => {
    const newStatus = userObj.status === "active" ? "inactive" : "active";
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userObj.id || (u as any)._id === (userObj as any)._id
          ? { ...u, status: newStatus }
          : u
      )
    );
    try {
      await api.users.updateStatus(userObj.id || (userObj as any)._id, newStatus);
    } catch {}
  };

  const navItems: { id: AdminTab; icon: React.ReactNode; label: string }[] = [
    {
      id: "dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: "Dashboard",
    },
    {
      id: "packages",
      icon: <PackageIcon className="w-4 h-4" />,
      label: "Packages",
    },
    {
      id: "orders",
      icon: <ShoppingBag className="w-4 h-4" />,
      label: "Bookings & Orders",
    },
    {
      id: "users",
      icon: <Users className="w-4 h-4" />,
      label: "Users Management",
    },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={
        mobile
          ? "w-60 bg-[#120808] h-full flex flex-col text-white"
          : "w-60 bg-[#120808] min-h-screen flex flex-col text-white shadow-xl"
      }
    >
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)" }}
          >
            <span className="text-white font-black text-sm" style={serif}>
              B
            </span>
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-none" style={serif}>
              BookMy<span style={{ color: "#FCBD70" }}>India</span>
            </div>
            <div className="text-white/40 text-[10px] mt-0.5" style={mono}>
              CONTROL CONSOLE
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${
              tab === item.id
                ? "text-white bg-white/10 shadow-inner"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
            style={sans}
          >
            {item.icon}
            <span>{item.label}</span>
            {tab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FA0301]" />
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-2">
        <button
          onClick={() => {
            refreshPackages();
            refreshOrders();
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full"
          style={sans}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Live DB</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full"
          style={sans}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to Website</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f5f2" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-60">
            <Sidebar mobile />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-stone-200/80 px-5 lg:px-8 py-4 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-stone-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-stone-600" />
            </button>
            <h2 className="font-bold text-stone-800 text-lg" style={serif}>
              {tab === "dashboard" && "Overview & Executive Dashboard"}
              {tab === "packages" && "Package Catalog Management"}
              {tab === "orders" && "Customer Bookings & Orders"}
              {tab === "users" && "User Accounts & Travellers"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: "#A2191B", ...mono }}
            >
              A
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-stone-800 leading-tight" style={sans}>
                Administrator
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold" style={mono}>
                ● Live System
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 lg:px-8 py-7 overflow-auto">
          {/* ─── 1. Dashboard Tab ─────────────────────────────────────────── */}
          {tab === "dashboard" && (
            <div className="flex flex-col gap-7">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Revenue"
                  value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
                  sub={`${orders.length} total bookings`}
                  color="#A2191B"
                  icon={<IndianRupee className="w-5 h-5" />}
                />
                <StatCard
                  label="Active Packages"
                  value={String(activePackages)}
                  sub={`${packages.length} in catalog`}
                  color="#1a7a3c"
                  icon={<PackageIcon className="w-5 h-5" />}
                />
                <StatCard
                  label="Confirmed Orders"
                  value={String(confirmedOrders)}
                  sub="paid & confirmed"
                  color="#1a5c8a"
                  icon={<ShoppingBag className="w-5 h-5" />}
                />
                <StatCard
                  label="Registered Travellers"
                  value={String(totalUsersCount)}
                  sub={`${totalGuests} total travellers`}
                  color="#8B6914"
                  icon={<Users className="w-5 h-5" />}
                />
              </div>

              {/* Quick Actions banner */}
              <div className="bg-gradient-to-r from-[#1a0a0a] to-[#3a1010] text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold" style={serif}>
                    Quick Package & Booking Management
                  </h3>
                  <p className="text-stone-300 text-xs mt-1" style={sans}>
                    Create new holiday packages, upload photos via Cloudinary, and update Razorpay order states.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPkg(null);
                    setShowPkgModal(true);
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-stone-900 bg-[#FCBD70] hover:bg-amber-300 transition-all shrink-0 flex items-center gap-1.5 shadow-md"
                  style={mono}
                >
                  <Plus className="w-4 h-4" />
                  NEW PACKAGE
                </button>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                  <div>
                    <h3 className="font-bold text-stone-800" style={serif}>
                      Recent Bookings
                    </h3>
                    <p className="text-xs text-stone-400" style={sans}>
                      Latest incoming package reservations
                    </p>
                  </div>
                  <button
                    onClick={() => setTab("orders")}
                    className="text-xs text-[#A2191B] font-bold hover:underline"
                    style={sans}
                  >
                    View all ({orders.length}) →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={sans}>
                    <thead>
                      <tr
                        className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest"
                        style={mono}
                      >
                        <th className="text-left px-6 py-3">Order ID</th>
                        <th className="text-left px-6 py-3 hidden sm:table-cell">
                          Package
                        </th>
                        <th className="text-left px-6 py-3 hidden md:table-cell">
                          Traveller
                        </th>
                        <th className="text-right px-6 py-3">Amount</th>
                        <th className="text-left px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => {
                        const s = STATUS_COLORS[o.status] || STATUS_COLORS.confirmed;
                        return (
                          <tr
                            key={o.orderId}
                            className="border-t border-stone-100 hover:bg-stone-50/60 transition-colors"
                          >
                            <td className="px-6 py-3.5 font-mono text-xs text-stone-500 font-semibold">
                              {o.orderId}
                            </td>
                            <td className="px-6 py-3.5 hidden sm:table-cell">
                              <div className="font-medium text-stone-800 truncate max-w-[200px]">
                                {o.packageTitle}
                              </div>
                              <div className="text-[11px] text-stone-400">
                                {o.travelDate} · {o.guests} guests
                              </div>
                            </td>
                            <td className="px-6 py-3.5 hidden md:table-cell text-stone-600 text-xs">
                              <div className="font-medium">{o.traveller?.name}</div>
                              <div className="text-stone-400 text-[11px]">
                                {o.traveller?.phone}
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-right font-bold text-stone-800 font-mono">
                              ₹{o.total?.toLocaleString()}
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{
                                  background: s.bg,
                                  color: s.text,
                                  ...mono,
                                }}
                              >
                                {s.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-8 text-stone-400 text-sm"
                          >
                            No bookings yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Packages grid */}
              <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-800" style={serif}>
                    Active Packages Highlights
                  </h3>
                  <button
                    onClick={() => setTab("packages")}
                    className="text-xs text-[#A2191B] font-bold hover:underline"
                    style={sans}
                  >
                    Manage all ({packages.length}) →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="border border-stone-200 rounded-2xl p-3 flex gap-3 items-center hover:border-stone-300 transition-colors bg-stone-50/50"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-bold text-stone-800 text-xs truncate"
                          style={serif}
                        >
                          {p.title}
                        </div>
                        <div
                          className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 truncate"
                          style={sans}
                        >
                          <MapPin className="w-3 h-3 text-[#A2191B]" />
                          {p.places}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className="font-bold text-xs text-[#A2191B]"
                            style={mono}
                          >
                            ₹{p.price.toLocaleString()}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-200 text-stone-600"
                            }`}
                            style={mono}
                          >
                            {p.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── 2. Packages Management Tab ───────────────────────────────── */}
          {tab === "packages" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex-1 flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white border-2 border-stone-200 rounded-2xl px-4 py-2.5 focus-within:border-[#A2191B] transition-colors shadow-xs">
                    <Search className="w-4 h-4 text-stone-400 shrink-0" />
                    <input
                      value={pkgSearch}
                      onChange={(e) => setPkgSearch(e.target.value)}
                      placeholder="Search packages by title or location…"
                      className="flex-1 outline-none text-sm text-stone-700 bg-transparent"
                      style={sans}
                    />
                  </div>

                  <select
                    value={pkgCategoryFilter}
                    onChange={(e) => setPkgCategoryFilter(e.target.value)}
                    className="bg-white border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-stone-700 outline-none focus:border-[#A2191B] transition-colors"
                    style={sans}
                  >
                    <option value="all">All Categories</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Nature">Nature</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Beach">Beach</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setEditingPkg(null);
                    setShowPkgModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-md shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#A2191B,#FA0301)",
                    ...sans,
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add New Package
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={sans}>
                    <thead>
                      <tr
                        className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest"
                        style={mono}
                      >
                        <th className="text-left px-5 py-3.5">Package Details</th>
                        <th className="text-left px-5 py-3.5 hidden md:table-cell">
                          Category
                        </th>
                        <th className="text-right px-5 py-3.5">Price</th>
                        <th className="text-left px-5 py-3.5 hidden sm:table-cell">
                          Duration
                        </th>
                        <th className="text-left px-5 py-3.5">Status</th>
                        <th className="text-right px-5 py-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPkgs.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-stone-100 hover:bg-stone-50/60 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-stone-800 text-sm leading-tight">
                                  {p.title}
                                </div>
                                <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#A2191B]" />
                                  {p.places}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span
                              className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{
                                background: "#f5f0eb",
                                color: "#7a5c5c",
                              }}
                            >
                              {p.category}
                            </span>
                          </td>
                          <td
                            className="px-5 py-4 text-right font-bold text-stone-800"
                            style={mono}
                          >
                            ₹{p.price.toLocaleString()}
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell text-stone-500 text-xs">
                            {p.duration}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => togglePackageActive(p.id)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                p.active
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                              }`}
                              style={mono}
                            >
                              {p.active ? "● Active" : "○ Inactive"}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPkg(p);
                                  setShowPkgModal(true);
                                }}
                                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                                title="Edit Package"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => togglePackageActive(p.id)}
                                className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center transition-colors hover:bg-amber-50 hover:text-amber-600"
                                title={p.active ? "Deactivate" : "Activate"}
                              >
                                {p.active ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete "${p.title}"?`
                                    )
                                  ) {
                                    deletePackage(p.id);
                                  }
                                }}
                                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                                title="Delete Package"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredPkgs.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-12 text-center text-stone-400 text-sm"
                            style={sans}
                          >
                            No packages match your search filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── 3. Orders Management Tab ─────────────────────────────────── */}
          {tab === "orders" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex-1 flex items-center gap-2 bg-white border-2 border-stone-200 rounded-2xl px-4 py-2.5 focus-within:border-[#A2191B] transition-colors w-full shadow-xs">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID, traveller name, email, or package title…"
                    className="flex-1 outline-none text-sm text-stone-700 bg-transparent"
                    style={sans}
                  />
                </div>

                <div className="flex items-center gap-2 bg-white border-2 border-stone-200 rounded-2xl px-4 py-2.5 shrink-0 shadow-xs">
                  <Filter className="w-4 h-4 text-stone-400" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="outline-none text-xs font-semibold text-stone-700 bg-transparent"
                    style={sans}
                  >
                    <option value="all">All Statuses ({orders.length})</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {filteredOrders.map((o) => {
                  const s = STATUS_COLORS[o.status] || STATUS_COLORS.confirmed;
                  const isOpen = expandedOrder === o.orderId;
                  return (
                    <div
                      key={o.orderId}
                      className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden transition-all duration-200 hover:border-stone-300"
                    >
                      <div
                        className="flex flex-wrap gap-4 items-center px-6 py-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                        onClick={() =>
                          setExpandedOrder(isOpen ? null : o.orderId)
                        }
                      >
                        <div className="flex-1 min-w-[240px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-stone-500">
                              {o.orderId}
                            </span>
                            <span
                              className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                              style={{
                                background: s.bg,
                                color: s.text,
                                ...mono,
                              }}
                            >
                              {s.label}
                            </span>
                          </div>
                          <div
                            className="font-bold text-stone-800 mt-1 text-sm"
                            style={serif}
                          >
                            {o.packageTitle}
                          </div>
                          <div
                            className="text-xs text-stone-400 mt-0.5"
                            style={sans}
                          >
                            {o.traveller?.name} · {o.travelDate} · {o.guests} guests
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div
                              className="font-bold text-stone-900 font-mono text-base"
                            >
                              ₹{o.total?.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-stone-400" style={sans}>
                              {o.paymentMethod || "Razorpay"}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Order Details */}
                      {isOpen && (
                        <div className="px-6 pb-6 pt-2 border-t border-stone-100 bg-stone-50/30">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            <div>
                              <div
                                className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3"
                                style={mono}
                              >
                                Traveller Contact Info
                              </div>
                              <div className="flex flex-col gap-2 text-xs" style={sans}>
                                <div className="flex justify-between border-b border-stone-100 pb-1">
                                  <span className="text-stone-400">Name:</span>
                                  <span className="font-semibold text-stone-800">
                                    {o.traveller?.name}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-stone-100 pb-1">
                                  <span className="text-stone-400">Email:</span>
                                  <span className="font-semibold text-stone-800">
                                    {o.traveller?.email}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-stone-100 pb-1">
                                  <span className="text-stone-400">Phone:</span>
                                  <span className="font-semibold text-stone-800">
                                    {o.traveller?.phone}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-1">
                                  <span className="text-stone-400">City:</span>
                                  <span className="font-semibold text-stone-800">
                                    {o.traveller?.city || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div
                                className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3"
                                style={mono}
                              >
                                Payment & Razorpay Info
                              </div>
                              <div className="flex flex-col gap-2 text-xs" style={sans}>
                                <div className="flex justify-between border-b border-stone-100 pb-1">
                                  <span className="text-stone-400">Payment ID:</span>
                                  <span className="font-mono font-medium text-stone-700">
                                    {o.paymentId || "pay_simulated"}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-stone-100 pb-1">
                                  <span className="text-stone-400">Subtotal:</span>
                                  <span className="font-mono font-medium text-stone-700">
                                    ₹{o.subtotal?.toLocaleString()}
                                  </span>
                                </div>
                                {o.discount > 0 && (
                                  <div className="flex justify-between border-b border-stone-100 pb-1 text-emerald-600">
                                    <span>Discount:</span>
                                    <span className="font-mono">
                                      −₹{o.discount?.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between border-b border-stone-100 pb-1">
                                  <span className="text-stone-400">GST Tax (5%):</span>
                                  <span className="font-mono font-medium text-stone-700">
                                    ₹{o.taxes?.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-1">
                                  <span className="font-bold text-stone-800">
                                    Total Paid:
                                  </span>
                                  <span className="font-mono font-bold text-[#A2191B]">
                                    ₹{o.total?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <div
                                className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3"
                                style={mono}
                              >
                                Live Status Controller
                              </div>
                              <div className="flex flex-col gap-2">
                                {(
                                  [
                                    "confirmed",
                                    "pending",
                                    "completed",
                                    "cancelled",
                                  ] as Order["status"][]
                                ).map((st) => {
                                  const sc = STATUS_COLORS[st];
                                  const isSelected = o.status === st;
                                  return (
                                    <button
                                      key={st}
                                      onClick={() =>
                                        updateOrderStatus(o.orderId, st)
                                      }
                                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                        isSelected
                                          ? "border-stone-800 shadow-xs"
                                          : "border-stone-200 hover:border-stone-300 bg-white"
                                      }`}
                                      style={{
                                        background: isSelected ? sc.bg : "white",
                                        color: isSelected ? sc.text : "#71717a",
                                        ...sans,
                                      }}
                                    >
                                      <span className="capitalize">{sc.label}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <div
                    className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-400 text-sm"
                    style={sans}
                  >
                    No bookings found matching current filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── 4. Users Management Tab ──────────────────────────────────── */}
          {tab === "users" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 bg-white border-2 border-stone-200 rounded-2xl px-4 py-2.5 focus-within:border-[#A2191B] transition-colors w-full sm:max-w-md shadow-xs">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, or city…"
                    className="flex-1 outline-none text-sm text-stone-700 bg-transparent"
                    style={sans}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Registered Users"
                  value={String(usersList.length)}
                  sub="total registered"
                  color="#1a5c8a"
                  icon={<Users className="w-5 h-5" />}
                />
                <StatCard
                  label="Active Accounts"
                  value={String(
                    usersList.filter((u) => u.status === "active").length
                  )}
                  sub="active status"
                  color="#1a7a3c"
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                  label="Avg Lifetime Value"
                  value={`₹${Math.round(
                    usersList.reduce((s, u) => s + (u.totalSpent || 0), 0) /
                      (usersList.filter((u) => u.totalBookings > 0).length || 1) /
                      1000
                  )}K`}
                  sub="per booking user"
                  color="#8B6914"
                  icon={<IndianRupee className="w-5 h-5" />}
                />
                <StatCard
                  label="Total Bookings"
                  value={String(
                    usersList.reduce((s, u) => s + (u.totalBookings || 0), 0)
                  )}
                  sub="across all users"
                  color="#A2191B"
                  icon={<ShoppingBag className="w-5 h-5" />}
                />
              </div>

              <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={sans}>
                    <thead>
                      <tr
                        className="bg-stone-50 text-stone-400 text-xs uppercase tracking-widest"
                        style={mono}
                      >
                        <th className="text-left px-5 py-3.5">User</th>
                        <th className="text-left px-5 py-3.5 hidden md:table-cell">
                          Contact
                        </th>
                        <th className="text-left px-5 py-3.5 hidden sm:table-cell">
                          City
                        </th>
                        <th className="text-right px-5 py-3.5">Bookings</th>
                        <th className="text-right px-5 py-3.5 hidden sm:table-cell">
                          Total Spent
                        </th>
                        <th className="text-left px-5 py-3.5">Status</th>
                        <th className="text-right px-5 py-3.5">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id || (u as any)._id}
                          className="border-t border-stone-100 hover:bg-stone-50/60 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                                <img
                                  src={
                                    u.avatar ||
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                                  }
                                  alt={u.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-stone-800 text-sm">
                                  {u.name}
                                </div>
                                <div
                                  className="text-xs text-stone-400 font-mono"
                                  style={mono}
                                >
                                  {u.id || (u as any)._id?.slice(-6) || "U-REC"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <div className="text-xs text-stone-700 font-medium">
                              {u.email}
                            </div>
                            <div className="text-xs text-stone-400 mt-0.5">
                              {u.phone || "—"}
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell text-stone-600 text-xs">
                            {u.city || "—"}
                          </td>
                          <td
                            className="px-5 py-4 text-right font-bold text-stone-800"
                            style={mono}
                          >
                            {u.totalBookings || 0}
                          </td>
                          <td
                            className="px-5 py-4 text-right font-bold text-stone-800 hidden sm:table-cell"
                            style={mono}
                          >
                            {u.totalSpent > 0
                              ? `₹${(u.totalSpent / 1000).toFixed(0)}K`
                              : "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                u.status === "active"
                                  ? "text-emerald-700 bg-emerald-50"
                                  : "text-stone-500 bg-stone-100"
                              }`}
                              style={mono}
                            >
                              {u.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                              style={sans}
                            >
                              {u.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-12 text-center text-stone-400 text-sm"
                            style={sans}
                          >
                            No users found matching search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Package Creation & Edit Modal */}
      {showPkgModal && (
        <PackageModal
          pkg={editingPkg ?? emptyPkg}
          onSave={handleSavePkg}
          onClose={() => {
            setShowPkgModal(false);
            setEditingPkg(null);
          }}
        />
      )}
    </div>
  );
}
