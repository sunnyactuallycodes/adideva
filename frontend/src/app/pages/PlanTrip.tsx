import { useState } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Heart,
  Plane,
  Camera,
  TreePine,
  Waves,
  Mountain,
  Award,
  Phone,
  CheckCircle2,
  Building,
  Car,
  Compass,
  ArrowRight,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { packages } from "../data";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

interface PlanTripData {
  destinations: string[];
  travelStyle: string;
  durationDays: number;
  season: string;
  adults: number;
  children: number;
  rooms: number;
  hotelTier: string;
  addOns: string[];
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadCity: string;
  specialNotes: string;
}

const regions = [
  { id: "rajasthan", name: "Rajasthan", sub: "Palaces, Forts & Desert Safaris", icon: "🏰", priceMult: 1.15 },
  { id: "kerala", name: "Kerala Backwaters", sub: "Houseboats, Munnar Tea Hills & Ayurveda", icon: "🌴", priceMult: 1.05 },
  { id: "himachal", name: "Himachal & Manali", sub: "Snow Peaks, Valleys & River Rafting", icon: "🏔️", priceMult: 1.0 },
  { id: "kashmir", name: "Kashmir Valley", sub: "Shikara on Dal Lake, Gulmarg & Pahalgam", icon: "🛶", priceMult: 1.2 },
  { id: "ladakh", name: "Ladakh Expeditions", sub: "Pangong Tso, Khardung La & Monasteries", icon: "🏍️", priceMult: 1.25 },
  { id: "goa", name: "Goa Coastal", sub: "Boutique Beach Resorts & Sunset Cruises", icon: "🌊", priceMult: 0.95 },
  { id: "andaman", name: "Andaman Islands", sub: "Havelock Island, Coral Reefs & Scuba", icon: "🤿", priceMult: 1.3 },
  { id: "varanasi", name: "Varanasi & Ganges", sub: "Spiritual Dawn Boats, Ghats & Temples", icon: "🪔", priceMult: 0.9 },
];

const styles = [
  { id: "heritage", title: "Royal Heritage & Palaces", desc: "Stay at historic royal estates, private palace tours with historians.", icon: Camera },
  { id: "honeymoon", title: "Romantic Honeymoon", desc: "Private pool villas, candlelight dinners, secluded valley viewpoints.", icon: Heart },
  { id: "nature", title: "Nature & Tranquility", desc: "Tea plantation bungalows, backwater houseboats, wildlife sanctuaries.", icon: TreePine },
  { id: "adventure", title: "Mountain & Adventure", desc: "High-altitude passes, rafting, desert camping & jeep safaris.", icon: Mountain },
  { id: "beach", title: "Coastal & Relaxation", desc: "Luxury beachside cabanas, sunset catamaran cruises, seafood feasts.", icon: Waves },
];

const hotelTiers = [
  { id: "royal", title: "Royal Palaces & Historic Havelis", desc: "Heritage luxury (Taj Lake Palace, Oberoi Amarvilas, Rambagh)", rate: 9500 },
  { id: "5star", title: "5-Star Ultra Luxury Resorts", desc: "Signature 5-star comfort (ITC, JW Marriott, The Leela)", rate: 7000 },
  { id: "boutique", title: "Boutique Retreats & Nature Villas", desc: "Curated private estates, plantation villas, luxury glamping", rate: 5200 },
  { id: "premium", title: "4-Star Premium Heritage", desc: "Comfortable, charming boutique accommodations with breakfast", rate: 3800 },
];

const addOnList = [
  { id: "chauffeur", title: "Private Chauffeur (Innova Crysta / Mercedes)", desc: "Dedicated AC vehicle available 24/7", cost: 15000 },
  { id: "guide", title: "ASI Certified Private Historian Guide", desc: "Personal guide for all monument visits", cost: 6000 },
  { id: "dinner", title: "Royal Candlelight Dining Experience", desc: "Curated multi-course dinner with cultural performance", cost: 8000 },
  { id: "helicopter", title: "Helicopter Transfers / Darshan", desc: "Direct aerial connectivity or temple darshan", cost: 35000 },
  { id: "spa", title: "Authentic Ayurvedic Spa Therapy", desc: "2-hour rejuvenation treatment per couple", cost: 7500 },
  { id: "safari", title: "Private Wildlife Jeep Safari with Naturalist", desc: "Exclusive jungle safari with priority permits", cost: 9500 },
];

export default function PlanTrip() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedPlan, setSubmittedPlan] = useState<{ id: string } | null>(null);

  const [formData, setFormData] = useState<PlanTripData>({
    destinations: ["rajasthan"],
    travelStyle: "heritage",
    durationDays: 7,
    season: "Oct – Dec (Golden Season)",
    adults: 2,
    children: 0,
    rooms: 1,
    hotelTier: "royal",
    addOns: ["chauffeur", "guide"],
    leadName: "",
    leadEmail: "",
    leadPhone: "",
    leadCity: "",
    specialNotes: "",
  });

  const toggleDestination = (id: string) => {
    setFormData((prev) => {
      const exists = prev.destinations.includes(id);
      if (exists && prev.destinations.length === 1) return prev;
      return {
        ...prev,
        destinations: exists
          ? prev.destinations.filter((d) => d !== id)
          : [...prev.destinations, id],
      };
    });
  };

  const toggleAddOn = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.includes(id)
        ? prev.addOns.filter((a) => a !== id)
        : [...prev.addOns, id],
    }));
  };

  // Calculation for live estimate
  const baseRatePerDay =
    hotelTiers.find((h) => h.id === formData.hotelTier)?.rate || 7000;
  const regionMultiplier =
    formData.destinations.reduce((acc, dId) => {
      const r = regions.find((x) => x.id === dId);
      return acc + (r ? r.priceMult : 1.0);
    }, 0) / (formData.destinations.length || 1);

  const totalGuests = formData.adults + formData.children;
  const hotelTotal = baseRatePerDay * formData.durationDays * formData.rooms;
  const addOnsTotal = formData.addOns.reduce((acc, aId) => {
    const item = addOnList.find((x) => x.id === aId);
    return acc + (item ? item.cost : 0);
  }, 0);

  const estimatedTotal = Math.round(
    (hotelTotal * regionMultiplier + addOnsTotal + 12000 * totalGuests) * 1.05
  );
  const estimatedPerPerson = Math.round(estimatedTotal / Math.max(1, totalGuests));

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadName || !formData.leadEmail || !formData.leadPhone) {
      alert("Please fill in all required contact details.");
      return;
    }
    const referenceId = `BMI-CUSTOM-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedPlan({ id: referenceId });
  };

  const matchingPackages = packages.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      <Nav />

      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <div className="pt-28 pb-10 bg-[#160606] text-white">
        <div className="max-w-6xl mx-auto px-5 lg:px-10">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-3" style={sans}>
            <button onClick={() => navigate("/")} className="hover:text-white">
              Home
            </button>
            <span>/</span>
            <span className="text-[#FCBD70]">Custom Itinerary Designer</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FCBD70] mb-2" style={mono}>
                <Sparkles className="w-4 h-4" />
                Tailormade Luxury Holidays
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2" style={serif}>
                Design Your Dream Indian Journey
              </h1>
              <p className="text-white/70 text-sm max-w-2xl font-light" style={sans}>
                Tell us where your heart longs to wander. Our senior trip architects will craft a bespoke itinerary tailored to your exact taste, pace, and passions.
              </p>
            </div>

            {/* Estimated Price Indicator */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shrink-0 text-right">
              <div className="text-[10px] uppercase font-bold text-white/60 tracking-wider" style={mono}>
                Estimated Investment
              </div>
              <div className="text-2xl font-bold text-[#FCBD70]" style={serif}>
                ₹{estimatedPerPerson.toLocaleString()}{" "}
                <span className="text-xs text-white/80 font-normal">/ person</span>
              </div>
              <div className="text-[11px] text-white/60" style={sans}>
                Total: ₹{estimatedTotal.toLocaleString()} for {totalGuests} guests
              </div>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-6 overflow-x-auto gap-4">
            {[
              { num: 1, label: "Destinations & Theme" },
              { num: 2, label: "Duration & Season" },
              { num: 3, label: "Palaces & Hotels" },
              { num: 4, label: "Group & Add-ons" },
              { num: 5, label: "Review & Submit" },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center gap-2 shrink-0 text-left transition-colors ${
                  currentStep === st.num
                    ? "text-[#FCBD70]"
                    : currentStep > st.num
                    ? "text-white"
                    : "text-white/40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === st.num
                      ? "bg-[#FCBD70] text-[#160606]"
                      : currentStep > st.num
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/40"
                  }`}
                  style={mono}
                >
                  {currentStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
                </div>
                <span className="text-xs font-semibold hidden sm:inline" style={sans}>
                  {st.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Planner Body ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 lg:px-10 py-12">
        {submittedPlan ? (
          /* Submission Success State */
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-14 shadow-lg text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-[#e6f4ec] text-[#1a7a3c] flex items-center justify-center mx-auto mb-6 shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#8B6914] text-xs font-bold mb-3" style={mono}>
              Inquiry Ref: {submittedPlan.id}
            </div>

            <h2 className="text-3xl font-bold text-stone-900 mb-3" style={serif}>
              Your Royal Itinerary Is Being Handcrafted
            </h2>

            <p className="text-sm text-stone-600 leading-relaxed mb-6" style={sans}>
              Thank you, <strong>{formData.leadName}</strong>. Our senior trip designer has received your custom plan for{" "}
              <strong>
                {formData.destinations
                  .map((d) => regions.find((r) => r.id === d)?.name)
                  .join(", ")}
              </strong>{" "}
              ({formData.durationDays} Days for {totalGuests} guests). We will reach out to you at{" "}
              <strong>{formData.leadPhone}</strong> within 3 business hours with a bespoke proposal.
            </p>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2" style={mono}>
                Plan Summary
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs" style={sans}>
                <div>
                  <span className="text-stone-400">Duration:</span> {formData.durationDays} Days
                </div>
                <div>
                  <span className="text-stone-400">Travel Style:</span> {formData.travelStyle}
                </div>
                <div>
                  <span className="text-stone-400">Hotel Style:</span>{" "}
                  {hotelTiers.find((h) => h.id === formData.hotelTier)?.title}
                </div>
                <div>
                  <span className="text-stone-400">Est. Budget:</span> ₹{estimatedTotal.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate("/packages")}
                className="px-6 py-3 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
                style={{
                  background: "linear-gradient(135deg,#A2191B,#FA0301)",
                  ...sans,
                }}
              >
                Browse Pre-Crafted Packages
              </button>
              <button
                onClick={() => {
                  setSubmittedPlan(null);
                  setCurrentStep(1);
                }}
                className="px-6 py-3 rounded-full text-xs font-bold text-stone-700 border border-stone-300 hover:border-stone-400 bg-white"
                style={sans}
              >
                Plan Another Tour
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Interactive Form */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Steps */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
              {/* Step 1: Destinations & Theme */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#A2191B]" style={mono}>
                      Step 1 of 5
                    </span>
                    <h2 className="text-2xl font-bold text-stone-900 mt-1" style={serif}>
                      Where would you like to travel?
                    </h2>
                    <p className="text-xs text-stone-500 mt-1" style={sans}>
                      Select one or multiple royal destinations to include in your circuit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {regions.map((reg) => {
                      const isSelected = formData.destinations.includes(reg.id);
                      return (
                        <div
                          key={reg.id}
                          onClick={() => toggleDestination(reg.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? "border-[#A2191B] bg-[#fff9f6] shadow-sm"
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <span className="text-2xl">{reg.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-stone-900" style={serif}>
                                {reg.name}
                              </h4>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-[#A2191B] text-white flex items-center justify-center text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5" style={sans}>
                              {reg.sub}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-stone-100">
                    <h3 className="font-bold text-sm text-stone-900 mb-3" style={serif}>
                      Select Your Desired Travel Style
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {styles.map((st) => {
                        const Icon = st.icon;
                        const isSelected = formData.travelStyle === st.id;
                        return (
                          <div
                            key={st.id}
                            onClick={() =>
                              setFormData({ ...formData, travelStyle: st.id })
                            }
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? "border-[#A2191B] bg-[#fff9f6] shadow-sm"
                                : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                background: isSelected ? "#A2191B" : "#f5f0eb",
                                color: isSelected ? "#fff" : "#A2191B",
                              }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-stone-900" style={serif}>
                                {st.title}
                              </h4>
                              <p className="text-[11px] text-stone-500 mt-0.5" style={sans}>
                                {st.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Duration & Season */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#A2191B]" style={mono}>
                      Step 2 of 5
                    </span>
                    <h2 className="text-2xl font-bold text-stone-900 mt-1" style={serif}>
                      Trip Duration & Preferred Dates
                    </h2>
                    <p className="text-xs text-stone-500 mt-1" style={sans}>
                      Customize how many days you wish to spend on this voyage.
                    </p>
                  </div>

                  {/* Duration Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400" style={mono}>
                        Number of Days
                      </label>
                      <span className="text-lg font-bold text-[#A2191B]" style={serif}>
                        {formData.durationDays} Days / {formData.durationDays - 1} Nights
                      </span>
                    </div>

                    <input
                      type="range"
                      min={3}
                      max={21}
                      step={1}
                      value={formData.durationDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationDays: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#A2191B]"
                    />

                    <div className="flex justify-between text-[11px] text-stone-400 mt-2 font-mono">
                      <span>3 Days (Quick Getaway)</span>
                      <span>7 Days (Classic)</span>
                      <span>14 Days (Grand Tour)</span>
                      <span>21 Days (Royal Odyssey)</span>
                    </div>
                  </div>

                  {/* Season / Month */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-3" style={mono}>
                      Preferred Travel Season
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Oct – Dec 2025 (Golden Autumn & Festivals)",
                        "Jan – Mar 2026 (Pleasant Winter & Palaces)",
                        "Apr – Jun 2026 (Himalayan Summer & Hills)",
                        "Jul – Sep 2026 (Monsoon Mist & Backwaters)",
                        "Flexible / Ready to Travel Any Month",
                      ].map((season) => (
                        <button
                          key={season}
                          type="button"
                          onClick={() => setFormData({ ...formData, season })}
                          className={`p-3.5 rounded-2xl border-2 text-left text-xs font-semibold transition-all ${
                            formData.season === season
                              ? "border-[#A2191B] bg-[#fff9f6] text-[#A2191B]"
                              : "border-stone-200 text-stone-700 hover:border-stone-300"
                          }`}
                          style={sans}
                        >
                          {season}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Accommodation Tier */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#A2191B]" style={mono}>
                      Step 3 of 5
                    </span>
                    <h2 className="text-2xl font-bold text-stone-900 mt-1" style={serif}>
                      Choose Your Preferred Stays
                    </h2>
                    <p className="text-xs text-stone-500 mt-1" style={sans}>
                      Every stay is hand-selected with priority views and royal hospitality.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {hotelTiers.map((tier) => {
                      const isSelected = formData.hotelTier === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() =>
                            setFormData({ ...formData, hotelTier: tier.id })
                          }
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? "border-[#A2191B] bg-[#fff9f6] shadow-sm"
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-[#A2191B]" />
                              <h4 className="font-bold text-sm text-stone-900" style={serif}>
                                {tier.title}
                              </h4>
                            </div>
                            <p className="text-xs text-stone-500 mt-1" style={sans}>
                              {tier.desc}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-[#A2191B]" style={mono}>
                              ~₹{tier.rate.toLocaleString()} / night
                            </div>
                            <span className="text-[10px] text-stone-400" style={sans}>
                              per room
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Group & Add-ons */}
              {currentStep === 4 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#A2191B]" style={mono}>
                      Step 4 of 5
                    </span>
                    <h2 className="text-2xl font-bold text-stone-900 mt-1" style={serif}>
                      Travellers & Exclusive Experiences
                    </h2>
                    <p className="text-xs text-stone-500 mt-1" style={sans}>
                      Tell us who is traveling and choose luxury additions.
                    </p>
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
                      <div className="text-xs font-bold text-stone-700 mb-1" style={sans}>
                        Adults (12+ yrs)
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              adults: Math.max(1, p.adults - 1),
                            }))
                          }
                          className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <span className="font-bold text-base" style={mono}>
                          {formData.adults}
                        </span>
                        <button
                          onClick={() =>
                            setFormData((p) => ({ ...p, adults: p.adults + 1 }))
                          }
                          className="w-8 h-8 rounded-full bg-[#A2191B] text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
                      <div className="text-xs font-bold text-stone-700 mb-1" style={sans}>
                        Children (under 12 yrs)
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              children: Math.max(0, p.children - 1),
                            }))
                          }
                          className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <span className="font-bold text-base" style={mono}>
                          {formData.children}
                        </span>
                        <button
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              children: p.children + 1,
                            }))
                          }
                          className="w-8 h-8 rounded-full bg-[#A2191B] text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
                      <div className="text-xs font-bold text-stone-700 mb-1" style={sans}>
                        Rooms Required
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              rooms: Math.max(1, p.rooms - 1),
                            }))
                          }
                          className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <span className="font-bold text-base" style={mono}>
                          {formData.rooms}
                        </span>
                        <button
                          onClick={() =>
                            setFormData((p) => ({ ...p, rooms: p.rooms + 1 }))
                          }
                          className="w-8 h-8 rounded-full bg-[#A2191B] text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Addons */}
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 mb-3" style={serif}>
                      Tailored Experiences & Add-ons
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addOnList.map((addon) => {
                        const isChecked = formData.addOns.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddOn(addon.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                              isChecked
                                ? "border-[#A2191B] bg-[#fff9f6]"
                                : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="mt-1 accent-[#A2191B]"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-stone-900" style={serif}>
                                  {addon.title}
                                </span>
                                <span className="text-[11px] font-bold text-[#A2191B]" style={mono}>
                                  +₹{addon.cost.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5" style={sans}>
                                {addon.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Lead Contact Details */}
              {currentStep === 5 && (
                <form onSubmit={handleSubmitPlan} className="flex flex-col gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#A2191B]" style={mono}>
                      Step 5 of 5
                    </span>
                    <h2 className="text-2xl font-bold text-stone-900 mt-1" style={serif}>
                      Where should we send your bespoke proposal?
                    </h2>
                    <p className="text-xs text-stone-500 mt-1" style={sans}>
                      Our trip curators will review your preferences and share a full itinerary draft.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                        Full Name *
                      </label>
                      <input
                        required
                        value={formData.leadName}
                        onChange={(e) =>
                          setFormData({ ...formData, leadName: e.target.value })
                        }
                        placeholder="e.g. Maharani Gayatri Devi"
                        className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#A2191B]"
                        style={sans}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.leadEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, leadEmail: e.target.value })
                        }
                        placeholder="e.g. gayatri@palace.in"
                        className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#A2191B]"
                        style={sans}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                        WhatsApp / Mobile Number *
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.leadPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, leadPhone: e.target.value })
                        }
                        placeholder="e.g. +91 98765 43210"
                        className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#A2191B]"
                        style={sans}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                        Departure City
                      </label>
                      <input
                        value={formData.leadCity}
                        onChange={(e) =>
                          setFormData({ ...formData, leadCity: e.target.value })
                        }
                        placeholder="e.g. Mumbai, Delhi, London, NYC"
                        className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#A2191B]"
                        style={sans}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                      Special Requests or Dietary / Accessibility Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.specialNotes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialNotes: e.target.value,
                        })
                      }
                      placeholder="e.g. Vegetarian cuisine only, private poolside haveli, celebrating 25th wedding anniversary…"
                      className="w-full border-2 border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#A2191B] resize-none"
                      style={sans}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg,#A2191B,#FA0301)",
                      ...sans,
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Request & Get Instant Custom Proposal</span>
                  </button>
                </form>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-6">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((p) => p - 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                    style={sans}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Step
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 5 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((p) => p + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
                    style={{
                      background: "linear-gradient(135deg,#A2191B,#FA0301)",
                      ...sans,
                    }}
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Summary & Live Estimate */}
            <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs">
                <h3 className="font-bold text-base text-stone-900 mb-4 pb-3 border-b border-stone-100" style={serif}>
                  Live Trip Summary
                </h3>

                <div className="flex flex-col gap-3 text-xs" style={sans}>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Circuits:</span>
                    <span className="font-semibold text-stone-800 text-right">
                      {formData.destinations
                        .map((d) => regions.find((r) => r.id === d)?.name)
                        .join(", ")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Duration:</span>
                    <span className="font-semibold text-stone-800">
                      {formData.durationDays} Days / {formData.durationDays - 1} Nights
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Travellers:</span>
                    <span className="font-semibold text-stone-800">
                      {formData.adults} Adults
                      {formData.children > 0 && `, ${formData.children} Kids`} ({formData.rooms} Rooms)
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Stay Category:</span>
                    <span className="font-semibold text-stone-800 text-right">
                      {hotelTiers.find((h) => h.id === formData.hotelTier)?.title.split(" ")[0]}{" "}
                      Luxury
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Add-ons:</span>
                    <span className="font-semibold text-stone-800">
                      {formData.addOns.length} Selected
                    </span>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-stone-500 font-bold uppercase text-[10px]" style={mono}>
                        Est. Cost / Person
                      </span>
                      <span className="text-xl font-bold text-[#A2191B]" style={serif}>
                        ₹{estimatedPerPerson.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-400">
                      <span>Total Estimated ({totalGuests} pax):</span>
                      <span className="font-mono text-stone-700 font-bold">
                        ₹{estimatedTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Includes 5% GST, private chauffeur, luxury rooms & 24/7 concierge.
                  </span>
                </div>
              </div>

              {/* Ready Made Packages Teaser */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs">
                <h4 className="font-bold text-xs text-stone-900 mb-3 uppercase tracking-widest" style={mono}>
                  Or Explore Instant Packages
                </h4>
                <div className="flex flex-col gap-3">
                  {matchingPackages.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/package/${p.id}`)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors cursor-pointer"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-stone-800 truncate" style={serif}>
                          {p.title}
                        </div>
                        <div className="text-[11px] text-[#A2191B] font-bold" style={mono}>
                          ₹{p.price.toLocaleString()} · {p.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
