import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  MapPin, ChevronDown, ChevronUp, Heart, Shield, Clock,
  Check, AlertTriangle, Info,
  Camera, Utensils, Hotel,
  ChevronLeft, ChevronRight, Share2,
  Car, FileText, Ban, Sun,
  CheckCircle, XCircle, X, Phone, Users, Star,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { packages, departureDates, type RoomSelection, totalGuests } from "../data";
import { useStore } from "../store";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px w-7 shrink-0" style={{ background: "#A2191B" }} />
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#A2191B", ...mono }}>{children}</span>
    </div>
  );
}

// ─── Itinerary data ───────────────────────────────────────────────────────────

const itinerary = [
  { day: 1, title: "Arrival in Delhi — City of Empires", location: "New Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=700&h=380&fit=crop&auto=format", meals: ["Dinner"], hotel: "The Lalit New Delhi ★★★★★", description: "Your journey begins with a warm welcome at Indira Gandhi International Airport. Your personal trip captain will greet you and transfer you to your hotel in a luxury AC vehicle. Enjoy a welcome dinner featuring authentic Mughlai cuisine. In the evening, witness the spectacular Sound & Light Show at the historic Red Fort — a stirring narrative of Delhi's 3,000-year story.", highlights: ["Airport pickup in luxury AC vehicle", "Check-in at 5-star hotel", "Sound & Light Show at Red Fort", "Welcome dinner"] },
  { day: 2, title: "Old Delhi & Qutub Minar — Layers of History", location: "New Delhi", image: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=700&h=380&fit=crop&auto=format", meals: ["Breakfast", "Lunch"], hotel: "The Lalit New Delhi ★★★★★", description: "Start your day early with a rickshaw ride through the narrow lanes of Chandni Chowk. Taste your way through parathas at Paranthe Wali Gali, sample jalebis, and sip the legendary lassi. Post-breakfast, explore the magnificent Qutub Minar complex (UNESCO). After lunch, visit Humayun's Tomb — the architectural precursor to the Taj Mahal.", highlights: ["Rickshaw ride through Chandni Chowk", "Breakfast at Paranthe Wali Gali", "Qutub Minar UNESCO Complex", "Humayun's Tomb sunset visit"] },
  { day: 3, title: "Delhi to Agra — On the Yamuna's Banks", location: "Delhi → Agra", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&h=380&fit=crop&auto=format", meals: ["Breakfast", "Dinner"], hotel: "Oberoi Amarvilas Agra ★★★★★", description: "After an early breakfast, depart for Agra via the Yamuna Expressway. En route, stop at Sikandra Fort — the mausoleum of Emperor Akbar. Arrive in Agra by early afternoon. Check in to Oberoi Amarvilas, which offers an unobstructed view of the Taj Mahal from every room. In the late afternoon, experience the Taj Mahal at sunset.", highlights: ["Yamuna Expressway road journey", "Akbar's Tomb at Sikandra", "Check-in at Oberoi Amarvilas", "Taj Mahal sunset visit"] },
  { day: 4, title: "Taj Mahal at Dawn & Agra Fort", location: "Agra", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=380&fit=crop&auto=format", meals: ["Breakfast", "Lunch"], hotel: "Oberoi Amarvilas Agra ★★★★★", description: "Rise before dawn for the most magical sight in India — the Taj Mahal bathed in the first golden light of morning. With far fewer crowds and mist still clinging to the Yamuna, this hour is transformative. Continue to the imposing Agra Fort (UNESCO). After lunch, visit the marble inlay artisans at their workshops, a craft passed down for 400 years.", highlights: ["Taj Mahal sunrise with ASI guide", "Agra Fort UNESCO Heritage tour", "Traditional marble inlay workshop", "Heritage lunch at Esphahan"] },
  { day: 5, title: "Agra to Jaipur — The Pink City Beckons", location: "Agra → Jaipur", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=700&h=380&fit=crop&auto=format", meals: ["Breakfast", "Dinner"], hotel: "Rambagh Palace Jaipur ★★★★★", description: "Morning departure for the Pink City via Fatehpur Sikri — the ghost city of Emperor Akbar, a magnificent 16th-century capital abandoned after just 14 years. Explore the Buland Darwaza, Jodha Bai Palace, and Panch Mahal. Continue to Jaipur, checking in to Rambagh Palace — once the official residence of the Maharaja of Jaipur.", highlights: ["Fatehpur Sikri ghost city", "Scenic drive through Rajasthan", "Royal check-in at Rambagh Palace", "Welcome with folk music"] },
  { day: 6, title: "Jaipur — Amber Fort & the Old City", location: "Jaipur", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=700&h=380&fit=crop&auto=format", meals: ["Breakfast", "Lunch", "Dinner"], hotel: "Rambagh Palace Jaipur ★★★★★", description: "A full day in Jaipur begins with the majestic Amber Fort — ascend by jeep to explore the mirrored Sheesh Mahal. Continue to City Palace, Jantar Mantar (UNESCO), and the iconic Hawa Mahal. Post-lunch, dive into the bazaars of the old walled city. End the day with a rooftop dinner and cultural performance.", highlights: ["Amber Fort jeep ascent + Sheesh Mahal", "Jantar Mantar UNESCO observatory", "Hawa Mahal photo stop", "Bazaar shopping & rooftop cultural dinner"] },
  { day: 7, title: "Departure — Until We Meet Again", location: "Jaipur → Home", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&h=380&fit=crop&auto=format", meals: ["Breakfast"], hotel: "—", description: "After a leisurely last breakfast at the palace, you have free time for any final shopping. Your private vehicle will transfer you to Jaipur International Airport or Railway Station. Your trip captain will be available until the moment you board. Thank you for choosing BookMyIndia — we hope these memories travel with you for a lifetime.", highlights: ["Leisurely last breakfast", "Optional Albert Hall Museum visit", "Private drop to airport/station", "Fond farewell from your trip captain"] },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop&auto=format", alt: "Taj Mahal at sunrise" },
  { src: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&h=400&fit=crop&auto=format", alt: "Amber Fort Jaipur" },
  { src: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=400&fit=crop&auto=format", alt: "Red Fort Delhi" },
  { src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&h=400&fit=crop&auto=format", alt: "Taj Mahal reflection" },
  { src: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop&auto=format", alt: "Jaipur palace" },
  { src: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=600&h=400&fit=crop&auto=format", alt: "India Gate" },
];

const inclusions = [
  "6 nights at handpicked 5-star hotels",
  "Daily breakfast + meals as per itinerary",
  "AC private vehicle throughout the tour",
  "Professional English-speaking certified guide",
  "All monument entrance fees",
  "Jeep ride at Amber Fort",
  "Welcome dinner & farewell gift hamper",
  "24/7 on-trip support from trip captain",
  "Complimentary travel insurance (up to ₹5 lakhs)",
  "All applicable taxes (GST 5%)",
];
const exclusions = [
  "Airfare / train tickets to/from Delhi & Jaipur",
  "Personal expenses, tips & porterage",
  "Meals not listed in the itinerary",
  "Camera fees inside monuments",
  "Optional activities",
];
const thingsToCarry = [
  { icon: "🪪", item: "Govt. Photo ID (Aadhar / Passport)", critical: true },
  { icon: "💊", item: "Personal medications & first aid kit", critical: true },
  { icon: "🧴", item: "Sunscreen SPF 50+ and lip balm", critical: false },
  { icon: "👟", item: "Comfortable walking shoes", critical: true },
  { icon: "🧣", item: "Shawl for temples & mosques", critical: true },
  { icon: "💧", item: "Reusable water bottle", critical: false },
  { icon: "📷", item: "Camera (extra batteries)", critical: false },
  { icon: "💳", item: "Card + ₹3,000–5,000 cash", critical: true },
  { icon: "🧢", item: "Hat or cap for outdoor hours", critical: false },
  { icon: "🪫", item: "Portable phone charger", critical: false },
];
const notes = [
  { type: "info", text: "Taj Mahal is closed every Friday. Your itinerary is designed around this." },
  { type: "warning", text: "Photography of military installations and bridges is strictly prohibited." },
  { type: "info", text: "Dress modestly when entering religious sites. Footwear must be removed." },
  { type: "warning", text: "Agra summers (April–June) reach 44°C+. Book Oct–March for the best experience." },
  { type: "warning", text: "Strictly no plastic bottles inside Taj Mahal. Only transparent bottles permitted." },
];
const cancellationPolicy = [
  { days: "30+ days before departure", refund: "100%", color: "#1a7a3c" },
  { days: "20–29 days before departure", refund: "75%", color: "#5c8a1a" },
  { days: "10–19 days before departure", refund: "50%", color: "#8B6914" },
  { days: "5–9 days before departure", refund: "25%", color: "#A2191B" },
  { days: "Less than 5 days / No-show", refund: "0%", color: "#7a0a0a" },
];

// ─── Room counter sub-component ───────────────────────────────────────────────

function RoomCounter({
  label, sublabel, pax, count,
  onInc, onDec, accentColor,
}: {
  label: string; sublabel: string; pax: number;
  count: number; onInc: () => void; onDec: () => void; accentColor: string;
}) {
  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${count > 0 ? "border-[#A2191B]/40" : "border-[#A2191B]/10"}`}
      style={{ background: count > 0 ? "#fff9f5" : "white" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accentColor}18` }}>
          <Users className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#1a0a0a]" style={sans}>{label}</div>
          <div className="text-xs text-[#7a5c5c]" style={sans}>{sublabel}</div>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onDec}
          disabled={count === 0}
          className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
          style={{ borderColor: accentColor, color: accentColor }}
          onMouseEnter={(e) => { if (count > 0) (e.currentTarget as HTMLButtonElement).style.background = accentColor; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >−</button>
        <span className="w-6 text-center text-base font-bold text-[#1a0a0a]" style={mono}>{count}</span>
        <button
          onClick={onInc}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all hover:scale-110"
          style={{ background: accentColor }}
        >+</button>
      </div>
    </div>
  );
}

// ─── Booking sidebar ──────────────────────────────────────────────────────────

function BookingSidebar({ pkg }: { pkg: any }) {
  const [rooms, setRooms] = useState<RoomSelection>({ double: 1, triple: 0, quad: 0 });
  const dates = pkg.departureDates && pkg.departureDates.length > 0 ? pkg.departureDates : departureDates;
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const navigate = useNavigate();

  const doublePrice = pkg.pricing?.double || pkg.price;
  const triplePrice = pkg.pricing?.triple || Math.round(pkg.price * 0.9);
  const quadPrice = pkg.pricing?.quad || Math.round(pkg.price * 0.8);

  const guests = totalGuests(rooms);
  const noRooms = guests === 0;
  
  const subtotal =
    rooms.double * 2 * doublePrice +
    rooms.triple * 3 * triplePrice +
    rooms.quad * 4 * quadPrice;

  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  const adj = (key: keyof RoomSelection, delta: number) =>
    setRooms((r) => ({ ...r, [key]: Math.max(0, r[key] + delta) }));

  const handleBook = () => {
    if (noRooms) return;
    navigate("/checkout", {
      state: {
        packageId: pkg.id,
        travelDate: selectedDate,
        guests,
        rooms,
        pricePerPerson: guests > 0 ? Math.round(subtotal / guests) : pkg.price,
      },
    });
  };

  return (
    <div className="sticky top-[148px] bg-white rounded-3xl border border-[#A2191B]/12 shadow-xl overflow-hidden">
      {/* Price header */}
      <div className="p-5 border-b border-[#A2191B]/8" style={{ background: "linear-gradient(135deg,#fdf5f0,#fff4e6)" }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#7a5c5c", ...mono }}>Starting from</div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold" style={{ color: "#A2191B", ...serif }}>₹{pkg.price.toLocaleString()}</span>
          <span className="text-sm text-[#7a5c5c] line-through" style={sans}>₹{pkg.originalPrice.toLocaleString()}</span>
        </div>
        <div className="text-xs text-[#7a5c5c]" style={sans}>per person · Double / Triple / Quad Sharing</div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Date */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: "#7a5c5c", ...mono }}>Departure Date</label>
          <div className="grid grid-cols-2 gap-2">
            {dates.slice(0, 6).map((d: string) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${selectedDate === d ? "border-[#A2191B] text-[#A2191B]" : "border-[#A2191B]/15 text-[#7a5c5c] hover:border-[#A2191B]/40"}`}
                style={{ ...sans, background: selectedDate === d ? "#fff4e6" : "white" }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Room selector with individual sharing rates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7a5c5c", ...mono }}>Room Sharing Type</label>
            {guests > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fff4e6", color: "#A2191B", ...sans }}>
                {guests} {guests === 1 ? "guest" : "guests"} total
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <RoomCounter label="Double Sharing" sublabel={`₹${doublePrice.toLocaleString()} / person`} pax={2} count={rooms.double}
              onInc={() => adj("double", 1)} onDec={() => adj("double", -1)} accentColor="#A2191B" />
            <RoomCounter label="Triple Sharing" sublabel={`₹${triplePrice.toLocaleString()} / person`} pax={3} count={rooms.triple}
              onInc={() => adj("triple", 1)} onDec={() => adj("triple", -1)} accentColor="#8B6914" />
            <RoomCounter label="Quad Sharing" sublabel={`₹${quadPrice.toLocaleString()} / person`} pax={4} count={rooms.quad}
              onInc={() => adj("quad", 1)} onDec={() => adj("quad", -1)} accentColor="#1a5c8a" />
          </div>
          {noRooms && (
            <p className="text-xs text-[#A2191B] mt-2" style={sans}>Please select at least one room sharing type.</p>
          )}
        </div>

        {/* Price breakdown */}
        {!noRooms && (
          <div className="bg-[#faf8f5] rounded-2xl p-4 border border-[#A2191B]/8">
            {rooms.double > 0 && (
              <div className="flex justify-between text-xs mb-1.5" style={sans}>
                <span className="text-[#7a5c5c]">{rooms.double} Double Room ({rooms.double * 2} pax @ ₹{doublePrice.toLocaleString()})</span>
                <span className="text-[#1a0a0a] font-mono font-medium">₹{(doublePrice * rooms.double * 2).toLocaleString()}</span>
              </div>
            )}
            {rooms.triple > 0 && (
              <div className="flex justify-between text-xs mb-1.5" style={sans}>
                <span className="text-[#7a5c5c]">{rooms.triple} Triple Room ({rooms.triple * 3} pax @ ₹{triplePrice.toLocaleString()})</span>
                <span className="text-[#1a0a0a] font-mono font-medium">₹{(triplePrice * rooms.triple * 3).toLocaleString()}</span>
              </div>
            )}
            {rooms.quad > 0 && (
              <div className="flex justify-between text-xs mb-1.5" style={sans}>
                <span className="text-[#7a5c5c]">{rooms.quad} Quad Room ({rooms.quad * 4} pax @ ₹{quadPrice.toLocaleString()})</span>
                <span className="text-[#1a0a0a] font-mono font-medium">₹{(quadPrice * rooms.quad * 4).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm my-2 pt-1.5 border-t border-[#A2191B]/8" style={sans}>
              <span className="text-[#7a5c5c]">GST Tax (5%)</span>
              <span className="font-medium text-[#1a0a0a] font-mono">₹{taxes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-[#A2191B]/10 pt-3">
              <span className="text-[#1a0a0a]" style={sans}>Total Payable</span>
              <span style={{ color: "#A2191B", ...serif, fontSize: "19px" }}>₹{total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={noRooms}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)", ...sans, boxShadow: noRooms ? "none" : "0 6px 24px rgba(250,3,1,0.28)" }}
        >
          Book This Package →
        </button>
        <button
          onClick={() => navigate("/plan-trip")}
          className="w-full py-3 rounded-2xl font-semibold text-[#A2191B] text-xs border-2 border-[#A2191B]/25 hover:border-[#A2191B] transition-colors"
          style={sans}
        >
          Customize This Itinerary
        </button>
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#1a7a3c]" />
          <span className="text-xs text-[#7a5c5c]" style={sans}>Free cancellation up to 30 days</span>
        </div>
        <a href="tel:+911800123456" className="flex items-center justify-center gap-2 text-xs font-bold hover:opacity-75 transition-opacity" style={{ color: "#A2191B", ...sans }}>
          <Phone className="w-3.5 h-3.5" />Call Concierge: 1800-123-4567
        </a>
      </div>
    </div>
  );
}

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { packages: storePackages } = useStore();
  const allPkgs = storePackages.length ? storePackages : packages;
  const pkg = allPkgs.find((p) => p.id === Number(id)) || allPkgs[0];
  const [liked, setLiked] = useState(false);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [termsOpen, setTermsOpen] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("overview");

  const sectionIds = ["overview", "itinerary", "gallery", "inclusions", "carry", "notes", "cancellation"];

  useEffect(() => {
    const handler = () => {
      for (const sid of [...sectionIds].reverse()) {
        const el = document.getElementById(sid);
        if (el && window.scrollY >= el.offsetTop - 170) { setActiveSection(sid); break; }
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      <Nav transparent />

      {/* Hero */}
      <div className="relative h-[70vh] min-h-[480px] overflow-hidden bg-[#1a0a0a]">
        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,10,10,0.1) 0%, rgba(26,10,10,0.55) 65%, rgba(26,10,10,0.92) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 lg:px-10 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-white/50 text-xs mb-4" style={sans}>
                  <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
                  <span>/</span><span className="text-white/80">{pkg.title}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3" style={{ background: "#A2191B22", border: "1px solid #A2191B66" }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#FA0301" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#FCBD70", ...mono }}>{pkg.badge} · {pkg.category}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-3" style={{ ...serif, lineHeight: "1.08" }}>
                  {pkg.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" style={{ color: "#FCBD70" }} /><span className="text-white/80 text-sm" style={sans}>{pkg.places}</span></div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" style={{ color: "#FCBD70" }} /><span className="text-white/80 text-sm" style={sans}>{pkg.duration}</span></div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4" fill="#FCBD70" stroke="#FCBD70" strokeWidth={1} />)}
                    <span className="text-white/70 text-sm ml-1.5" style={sans}>{pkg.rating} ({pkg.reviews.toLocaleString()})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-all">
                  <Heart className="w-5 h-5" fill={liked ? "#FA0301" : "none"} stroke={liked ? "#FA0301" : "white"} strokeWidth={2} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-all">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-white border-b border-[#A2191B]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[
              { icon: Clock, label: "Duration", value: pkg.duration },
              { icon: Car, label: "Pickup", value: "IGI Airport, New Delhi" },
              { icon: MapPin, label: "Drop", value: "Jaipur Airport / Railway" },
              { icon: Users, label: "Group Size", value: `2 – ${pkg.maxGuests} persons` },
              { icon: Sun, label: "Best Season", value: "Oct – Mar" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-4 px-5 shrink-0 border-r border-[#A2191B]/8 last:border-r-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fff4e6" }}>
                  <Icon className="w-4 h-4" style={{ color: "#A2191B" }} />
                </div>
                <div>
                  <div className="text-xs text-[#7a5c5c] leading-none mb-0.5" style={{ ...mono, letterSpacing: "0.08em" }}>{label}</div>
                  <div className="text-sm font-semibold text-[#1a0a0a] leading-none" style={sans}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="bg-white border-b border-[#A2191B]/8 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {sectionIds.map((sid) => (
              <button
                key={sid}
                onClick={() => document.getElementById(sid)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={`px-4 py-3.5 text-sm font-medium shrink-0 border-b-2 transition-all capitalize ${activeSection === sid ? "border-[#A2191B] text-[#A2191B]" : "border-transparent text-[#7a5c5c] hover:text-[#1a0a0a]"}`}
                style={sans}
              >
                {sid === "carry" ? "Pack List" : sid.charAt(0).toUpperCase() + sid.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 flex flex-col gap-14">

            {/* Overview */}
            <div id="overview" className="scroll-mt-40">
              <Label>About This Package</Label>
              <h2 className="text-3xl font-bold text-[#1a0a0a] mb-4" style={serif}>Why This Tour?</h2>
              <p className="text-[#3a2a2a] leading-relaxed mb-7 text-base whitespace-pre-line" style={{ ...sans, fontWeight: 300 }}>
                {pkg.overview || `The ${pkg.title} is an extraordinary luxury travel circuit — bringing together the finest royal palaces, UNESCO World Heritage architecture, certified local guides, and bespoke experiences. Every hotel, private transfer, meal, and timing is meticulously crafted to ensure you experience India at its most magical.`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pkg.highlights.map((h: string) => (
                  <div key={h} className="flex items-center gap-2.5 p-4 rounded-xl border border-[#A2191B]/10 bg-white hover:shadow-sm transition-shadow">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fff4e6" }}>
                      <Check className="w-3 h-3" style={{ color: "#A2191B" }} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-medium text-[#1a0a0a]" style={sans}>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div id="itinerary" className="scroll-mt-40">
              <Label>Day-Wise Plan</Label>
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#1a0a0a]" style={serif}>Your {pkg.days || ((pkg.itinerary && pkg.itinerary.length > 0) ? pkg.itinerary.length : itinerary.length)}-Day Journey</h2>
                <button onClick={() => setOpenDay(openDay !== null ? null : 1)} className="text-sm font-medium hover:opacity-75 transition-opacity" style={{ color: "#A2191B", ...sans }}>
                  {openDay !== null ? "Collapse" : "Expand All"}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {((pkg.itinerary && pkg.itinerary.length > 0) ? pkg.itinerary : itinerary).map((day: any) => (
                  <div key={day.day} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openDay === day.day ? "border-[#A2191B]/30 shadow-md" : "border-[#A2191B]/10 bg-white hover:border-[#A2191B]/20"}`}>
                    <button
                      className="w-full flex items-center gap-4 p-5 text-left"
                      style={{ background: openDay === day.day ? "linear-gradient(to right, #fff4e6, #ffffff)" : "white" }}
                      onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                    >
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: openDay === day.day ? "linear-gradient(135deg,#A2191B,#FA0301)" : "#f5f0eb" }}>
                        <span className="text-xs leading-none" style={{ ...mono, color: openDay === day.day ? "rgba(255,255,255,0.7)" : "#7a5c5c" }}>Day</span>
                        <span className="text-lg leading-none font-bold" style={{ ...serif, color: openDay === day.day ? "white" : "#A2191B" }}>{day.day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#A2191B" }} />
                          <span className="text-xs" style={{ color: "#7a5c5c", ...mono }}>{day.location || pkg.places}</span>
                        </div>
                        <h3 className="font-bold text-[#1a0a0a] text-base truncate pr-4" style={serif}>{day.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          {(day.meals || ["Breakfast", "Dinner"]).map((m: string) => (
                            <span key={m} className="flex items-center gap-1 text-xs text-[#7a5c5c]" style={sans}>
                              <Utensils className="w-3 h-3" style={{ color: "#FCBD70" }} />{m}
                            </span>
                          ))}
                          {day.hotel && day.hotel !== "—" && (
                            <span className="flex items-center gap-1 text-xs text-[#7a5c5c]" style={sans}>
                              <Hotel className="w-3 h-3" style={{ color: "#FCBD70" }} />{day.hotel}
                            </span>
                          )}
                        </div>
                      </div>
                      {openDay === day.day ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: "#A2191B" }} /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#7a5c5c]" />}
                    </button>
                    {openDay === day.day && (
                      <div className="border-t border-[#A2191B]/8">
                        <div className="grid grid-cols-1 md:grid-cols-5">
                          <div className="md:col-span-2 h-48 md:h-auto overflow-hidden bg-[#f5f0eb]">
                            <img src={day.image || pkg.image} alt={day.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="md:col-span-3 p-6 flex flex-col gap-4">
                            <p className="text-sm text-[#3a2a2a] leading-relaxed" style={{ ...sans, fontWeight: 300 }}>{day.description}</p>
                            {day.highlights && day.highlights.length > 0 && (
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#7a5c5c", ...mono }}>Day Highlights</div>
                                <div className="flex flex-col gap-1.5">
                                  {day.highlights.map((dh: string) => (
                                    <div key={dh} className="flex items-center gap-2 text-xs text-[#1a0a0a]" style={sans}>
                                      <CheckCircle className="w-3.5 h-3.5 shrink-0 text-[#1a7a3c]" />{dh}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div id="gallery" className="scroll-mt-40">
              <Label>Visual Journey</Label>
              <h2 className="text-3xl font-bold text-[#1a0a0a] mb-6" style={serif}>Tour Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden">
                {((pkg.galleryImages && pkg.galleryImages.length > 0) ? pkg.galleryImages : galleryImages).map((img: any, i: number) => (
                  <div key={i} className={`relative overflow-hidden cursor-pointer group bg-[#f5f0eb] ${i === 0 ? "col-span-2 row-span-2" : ""}`} style={{ height: i === 0 ? "340px" : "165px" }} onClick={() => setLightbox(i)}>
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {i === 5 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-lg font-bold" style={serif}>+24 more</span></div>}
                  </div>
                ))}
              </div>
              {lightbox !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                  <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><X className="w-5 h-5" /></button>
                  <button className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }}><ChevronLeft className="w-5 h-5" /></button>
                  <img src={(((pkg.galleryImages && pkg.galleryImages.length > 0) ? pkg.galleryImages : galleryImages)[lightbox]?.src || "").replace("w=600&h=400", "w=1200&h=800")} alt="Gallery Lightbox" className="max-w-4xl w-full max-h-[80vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
                  <button className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(((pkg.galleryImages && pkg.galleryImages.length > 0) ? pkg.galleryImages.length : galleryImages.length) - 1, lightbox + 1)); }}><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
            </div>

            {/* Inclusions */}
            <div id="inclusions" className="scroll-mt-40">
              <Label>What's Covered</Label>
              <h2 className="text-3xl font-bold text-[#1a0a0a] mb-6" style={serif}>Inclusions & Exclusions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-[#A2191B]/10 p-5">
                  <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[#A2191B]/8">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#e6f4ec" }}><CheckCircle className="w-5 h-5" style={{ color: "#1a7a3c" }} /></div>
                    <h3 className="font-bold text-[#1a0a0a]" style={serif}>Included</h3>
                  </div>
                  {((pkg.inclusions && pkg.inclusions.length > 0) ? pkg.inclusions : inclusions).map((item: string) => (
                    <div key={item} className="flex items-start gap-3 mb-2.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#1a7a3c" }} strokeWidth={2.5} />
                      <span className="text-sm text-[#3a2a2a]" style={sans}>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-[#A2191B]/10 p-5">
                  <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[#A2191B]/8">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fde8e8" }}><XCircle className="w-5 h-5" style={{ color: "#A2191B" }} /></div>
                    <h3 className="font-bold text-[#1a0a0a]" style={serif}>Not Included</h3>
                  </div>
                  {((pkg.exclusions && pkg.exclusions.length > 0) ? pkg.exclusions : exclusions).map((item: string) => (
                    <div key={item} className="flex items-start gap-3 mb-2.5">
                      <X className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#A2191B" }} strokeWidth={2.5} />
                      <span className="text-sm text-[#3a2a2a]" style={sans}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Things to carry */}
            <div id="carry" className="scroll-mt-40">
              <Label>Pack Smart</Label>
              <h2 className="text-3xl font-bold text-[#1a0a0a] mb-2" style={serif}>Things to Carry</h2>
              <p className="text-sm text-[#7a5c5c] mb-6" style={sans}>Items with a red dot are essential.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {((pkg.thingsToCarry && pkg.thingsToCarry.length > 0) ? pkg.thingsToCarry : thingsToCarry).map(({ icon, item, critical }: any) => (
                  <div key={item} className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: critical ? "#fff9f9" : "white", borderColor: critical ? "rgba(162,25,27,0.2)" : "rgba(162,25,27,0.08)" }}>
                    <span className="text-2xl leading-none">{icon}</span>
                    <span className="text-sm text-[#1a0a0a] flex-1" style={sans}>{item}</span>
                    {critical && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#FA0301" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div id="notes" className="scroll-mt-40">
              <Label>Important Information</Label>
              <h2 className="text-3xl font-bold text-[#1a0a0a] mb-6" style={serif}>Notes & Safety</h2>
              <div className="flex flex-col gap-3">
                {notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border" style={{ background: note.type === "warning" ? "#fffbf0" : "#f0f7ff", borderColor: note.type === "warning" ? "rgba(139,105,20,0.25)" : "rgba(26,92,138,0.2)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: note.type === "warning" ? "#fef3c7" : "#dbeafe" }}>
                      {note.type === "warning" ? <AlertTriangle className="w-4 h-4" style={{ color: "#8B6914" }} /> : <Info className="w-4 h-4" style={{ color: "#1a5c8a" }} />}
                    </div>
                    <p className="text-sm text-[#1a0a0a] leading-relaxed" style={sans}>{note.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation */}
            <div id="cancellation" className="scroll-mt-40">
              <Label>Refund Policy</Label>
              <h2 className="text-3xl font-bold text-[#1a0a0a] mb-6" style={serif}>Cancellation Policy</h2>
              <div className="bg-white rounded-2xl border border-[#A2191B]/10 overflow-hidden">
                {cancellationPolicy.map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < cancellationPolicy.length - 1 ? "border-b border-[#A2191B]/6" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Ban className="w-4 h-4 shrink-0" style={{ color: row.color }} />
                      <span className="text-sm text-[#3a2a2a]" style={sans}>{row.days}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: row.color, ...mono }}>{row.refund} refund</span>
                  </div>
                ))}
                <div className="px-6 py-4 border-t border-[#A2191B]/8" style={{ background: "#fff9f0" }}>
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#8B6914" }} />
                    <p className="text-xs text-[#7a5c5c] leading-relaxed" style={sans}>Cancellations must be submitted in writing to cancellations@bookmyindia.com. Refunds processed within 7–10 working days.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="scroll-mt-40">
              <Label>Legal</Label>
              <h2 className="text-3xl font-bold text-[#1a0a0a] mb-6" style={serif}>Terms & Conditions</h2>
              {[
                { title: "Booking & Payments", items: ["A non-refundable deposit of ₹5,000 per person is required to confirm your reservation.", "Full payment must be completed 30 days before departure.", "Prices are in INR and subject to change until booking is confirmed."] },
                { title: "Traveller Responsibilities", items: ["All travellers must carry a valid government photo ID throughout the trip.", "Travellers are responsible for obtaining any visas or travel documents required.", "BookMyIndia is not responsible for loss or theft of personal belongings."] },
              ].map(({ title, items }) => (
                <div key={title} className="bg-white rounded-2xl border border-[#A2191B]/10 overflow-hidden mb-3">
                  <button className="w-full flex items-center justify-between p-5 text-left hover:bg-[#faf8f5] transition-colors" onClick={() => setTermsOpen(termsOpen === title ? null : title)}>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 shrink-0" style={{ color: "#A2191B" }} />
                      <span className="font-semibold text-[#1a0a0a]" style={sans}>{title}</span>
                    </div>
                    {termsOpen === title ? <ChevronUp className="w-5 h-5 text-[#7a5c5c]" /> : <ChevronDown className="w-5 h-5 text-[#7a5c5c]" />}
                  </button>
                  {termsOpen === title && (
                    <div className="px-5 pb-5 border-t border-[#A2191B]/6">
                      <ol className="flex flex-col gap-3 mt-4">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-xs font-bold shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center" style={{ background: "#fff4e6", color: "#A2191B", ...mono }}>{i + 1}</span>
                            <span className="text-sm text-[#3a2a2a] leading-relaxed" style={sans}>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BookingSidebar pkg={pkg} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
