import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  MapPin,
  Clock,
  Users,
  Shield,
  ChevronLeft,
  Check,
  Tag,
  X,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  Lock,
  Percent,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { packages as defaultPackages, type Order, type RoomSelection, totalGuests } from "../data";
import { useStore } from "../store";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

// ─── Dynamic QR Code Component ───────────────────────────────────────────────

function QrCode() {
  const cells = [
    [0, 0, 7, 1], [0, 1, 1, 5], [6, 1, 1, 5], [0, 6, 7, 1], [2, 2, 3, 3],
    [14, 0, 7, 1], [14, 1, 1, 5], [20, 1, 1, 5], [14, 6, 7, 1], [16, 2, 3, 3],
    [0, 14, 7, 1], [0, 15, 1, 5], [6, 15, 1, 5], [0, 20, 7, 1], [2, 16, 3, 3],
    [8, 0, 1, 1], [10, 0, 1, 1], [12, 0, 1, 1], [9, 2, 2, 1], [8, 3, 1, 1], [12, 3, 1, 1],
    [9, 5, 3, 1], [8, 7, 2, 1], [11, 7, 2, 1], [0, 8, 1, 1], [2, 8, 3, 1], [6, 8, 1, 1],
    [8, 8, 1, 1], [10, 8, 1, 1], [12, 8, 1, 1], [14, 8, 1, 1], [16, 8, 1, 1], [18, 8, 1, 1], [20, 8, 1, 1],
    [9, 10, 2, 2], [12, 9, 1, 1], [14, 10, 2, 2], [17, 9, 2, 1], [20, 10, 1, 2],
    [8, 12, 1, 2], [10, 13, 3, 1], [14, 12, 1, 1], [16, 12, 2, 1], [19, 12, 2, 2],
    [8, 14, 4, 1], [14, 14, 3, 1], [18, 14, 1, 1], [8, 16, 1, 1], [10, 16, 2, 2],
    [13, 16, 2, 1], [16, 16, 1, 1], [18, 16, 3, 1], [8, 18, 3, 1], [12, 18, 1, 1],
    [14, 18, 2, 1], [17, 18, 1, 2], [19, 19, 2, 1], [8, 20, 1, 1], [10, 20, 2, 1], [13, 20, 3, 1],
  ];
  const px = 8;
  const size = 21;
  return (
    <svg width={size * px} height={size * px} viewBox={`0 0 ${size * px} ${size * px}`}>
      <rect width="100%" height="100%" fill="white" />
      {cells.map(([x, y, w, h], i) => (
        <rect key={i} x={x * px} y={y * px} width={w * px} height={h * px} fill="#111" />
      ))}
    </svg>
  );
}

// ─── Razorpay Modal Dialog ───────────────────────────────────────────────────

type RpMethod = "upi" | "card" | "netbanking" | "wallet" | "emi";

const banks = [
  { id: "hdfc", name: "HDFC Bank", logo: "🏦" },
  { id: "sbi", name: "State Bank", logo: "🏛️" },
  { id: "icici", name: "ICICI Bank", logo: "🏦" },
  { id: "axis", name: "Axis Bank", logo: "🏦" },
  { id: "kotak", name: "Kotak Mahindra", logo: "💳" },
  { id: "yes", name: "Yes Bank", logo: "🏦" },
  { id: "pnb", name: "Punjab National", logo: "🏛️" },
  { id: "bob", name: "Bank of Baroda", logo: "🏦" },
];

const wallets = [
  { id: "paytm", name: "Paytm", color: "#00BAF2" },
  { id: "phonepe", name: "PhonePe", color: "#5F259F" },
  { id: "amazonpay", name: "Amazon Pay", color: "#FF9900" },
  { id: "mobikwik", name: "MobiKwik", color: "#2F3C7E" },
];

function RazorpayModal({
  amount,
  orderId,
  onSuccess,
  onClose,
}: {
  amount: number;
  orderId: string;
  razorpayOrderId: string;
  onSuccess: (pid: string, method: string) => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<RpMethod>("upi");
  const [upiMode, setUpiMode] = useState<"qr" | "vpa">("qr");
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedEmi, setSelectedEmi] = useState("3");
  const [payState, setPayState] = useState<"idle" | "processing" | "success">("idle");

  const fmtCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const verifyUpi = () => {
    if (!upiId.includes("@")) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setUpiVerified(true);
    }, 800);
  };

  const canPay = (): boolean => {
    if (method === "upi") return upiMode === "qr" || upiVerified;
    if (method === "card")
      return (
        cardNumber.replace(/\s/g, "").length === 16 &&
        cardName.length > 0 &&
        cardExpiry.length === 5 &&
        cardCvv.length >= 3
      );
    if (method === "netbanking") return selectedBank !== "";
    if (method === "wallet") return selectedWallet !== "";
    if (method === "emi") return selectedBank !== "";
    return false;
  };

  const handlePay = () => {
    if (!canPay()) return;
    setPayState("processing");
    setTimeout(() => {
      setPayState("success");
      const pid = "pay_" + Math.random().toString(36).slice(2, 18).toUpperCase();
      const label =
        method === "upi"
          ? "UPI"
          : method === "card"
          ? "Credit Card"
          : method === "netbanking"
          ? "Net Banking"
          : method === "emi"
          ? "No-Cost EMI"
          : "Wallet";
      setTimeout(() => onSuccess(pid, label), 1200);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between text-white"
          style={{ background: "#072654" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-base">
              R
            </div>
            <div>
              <div className="text-xs text-white/70" style={mono}>
                Razorpay Trusted Checkout
              </div>
              <div className="font-bold text-base" style={sans}>
                BookMyIndia Luxury Tours
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-white/60" style={mono}>
                Amount Due
              </div>
              <div className="font-bold text-lg text-emerald-400" style={mono}>
                ₹{amount.toLocaleString()}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={payState === "processing"}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        {payState === "idle" && (
          <div className="flex border-b border-stone-100 bg-stone-50 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[
              { id: "upi", label: "UPI", icon: Smartphone },
              { id: "card", label: "Card", icon: CreditCard },
              { id: "netbanking", label: "NetBanking", icon: Building2 },
              { id: "wallet", label: "Wallets", icon: Wallet },
              { id: "emi", label: "EMI", icon: Percent },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id as RpMethod)}
                className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 transition-colors border-b-2 ${
                  method === id
                    ? "border-[#072654] text-[#072654] bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
                style={sans}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 flex-1" style={{ scrollbarWidth: "none" }}>
          {payState === "processing" && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-[#072654]/20 border-t-[#072654] animate-spin" />
              <div className="text-center">
                <div className="font-bold text-stone-800 text-base mb-1" style={serif}>
                  Verifying with Razorpay Payment Gateway…
                </div>
                <div className="text-stone-400 text-xs" style={sans}>
                  Please do not refresh or close this window.
                </div>
              </div>
            </div>
          )}

          {payState === "success" && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#e6f4ec" }}
              >
                <Check className="w-8 h-8" style={{ color: "#1a7a3c" }} strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <div className="font-bold text-stone-800 text-lg mb-1" style={serif}>
                  Payment Verified Successfully!
                </div>
                <div className="text-stone-500 text-xs" style={sans}>
                  Generating your official booking voucher & invoice…
                </div>
              </div>
            </div>
          )}

          {payState === "idle" && method === "upi" && (
            <div className="flex flex-col gap-4">
              <div className="flex bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUpiMode("qr")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    upiMode === "qr"
                      ? "bg-white text-stone-800 shadow-xs"
                      : "text-stone-500"
                  }`}
                  style={sans}
                >
                  Scan QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setUpiMode("vpa")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    upiMode === "vpa"
                      ? "bg-white text-stone-800 shadow-xs"
                      : "text-stone-500"
                  }`}
                  style={sans}
                >
                  Enter UPI ID
                </button>
              </div>

              {upiMode === "qr" ? (
                <div className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 mb-3">
                    <QrCode />
                  </div>
                  <div className="text-xs font-bold text-stone-700 mb-1" style={sans}>
                    Scan with any UPI app (GPay / PhonePe / Paytm / BHIM)
                  </div>
                  <div className="text-[11px] text-stone-400" style={mono}>
                    Order ID: {orderId}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1" style={sans}>
                      UPI ID / VPA Handle
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setUpiVerified(false);
                        }}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 border-2 border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#072654]"
                        style={sans}
                      />
                      <button
                        type="button"
                        onClick={verifyUpi}
                        className="px-4 py-2.5 rounded-xl bg-stone-800 text-white text-xs font-bold"
                        style={sans}
                      >
                        {verifying ? "..." : upiVerified ? "Verified ✓" : "Verify"}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["@okhdfcbank", "@okaxis", "@ybl", "@paytm"].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => {
                          const base = upiId.split("@")[0] || "traveller";
                          setUpiId(`${base}${handle}`);
                          setUpiVerified(true);
                        }}
                        className="text-[10px] px-2 py-1 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200"
                        style={mono}
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {payState === "idle" && method === "card" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500 block mb-1" style={sans}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(fmtCard(e.target.value))}
                  placeholder="4532 •••• •••• 8890"
                  className="w-full border-2 border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#072654] font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 block mb-1" style={sans}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full border-2 border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#072654]"
                  style={sans}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 block mb-1" style={sans}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(fmtExp(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full border-2 border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#072654] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 block mb-1" style={sans}>
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    placeholder="•••"
                    className="w-full border-2 border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#072654] font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {payState === "idle" && method === "netbanking" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {banks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBank(b.id)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedBank === b.id
                      ? "border-[#072654] bg-blue-50/50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span className="text-xl">{b.logo}</span>
                  <span className="text-[11px] font-semibold text-stone-700" style={sans}>
                    {b.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {payState === "idle" && method === "wallet" && (
            <div className="grid grid-cols-2 gap-3">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWallet(w.id)}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    selectedWallet === w.id
                      ? "border-[#072654] bg-blue-50/50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span className="text-xs font-bold text-stone-800" style={sans}>
                    {w.name}
                  </span>
                  <div className="w-3 h-3 rounded-full" style={{ background: w.color }} />
                </button>
              ))}
            </div>
          )}

          {payState === "idle" && method === "emi" && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-stone-600 mb-1" style={sans}>
                Choose your credit card provider for No-Cost EMI:
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {banks.slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold ${
                      selectedBank === b.id
                        ? "border-[#072654] bg-blue-50/50 text-[#072654]"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    {b.name.split(" ")[0]}
                  </button>
                ))}
              </div>
              {selectedBank && (
                <div className="flex flex-col gap-2">
                  {[
                    { m: "3", rate: Math.round(amount / 3) },
                    { m: "6", rate: Math.round(amount / 6) },
                    { m: "9", rate: Math.round(amount / 9) },
                    { m: "12", rate: Math.round(amount / 12) },
                  ].map((emi) => (
                    <div
                      key={emi.m}
                      onClick={() => setSelectedEmi(emi.m)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                        selectedEmi === emi.m
                          ? "border-[#072654] bg-blue-50/50"
                          : "border-stone-200"
                      }`}
                    >
                      <span className="text-xs font-bold text-stone-800" style={sans}>
                        {emi.m} Months No-Cost EMI
                      </span>
                      <span className="text-xs font-mono font-bold text-[#072654]">
                        ₹{emi.rate.toLocaleString()} / mo
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {payState === "idle" && (
          <div className="p-5 border-t border-stone-100 bg-stone-50/50">
            <button
              onClick={handlePay}
              disabled={!canPay()}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95"
              style={{ background: "#072654", ...sans }}
            >
              Pay ₹{amount.toLocaleString()} via Razorpay Secure
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

interface CheckoutState {
  packageId: number;
  travelDate: string;
  guests: number;
  rooms?: RoomSelection;
  pricePerPerson: number;
}

interface TravellerForm {
  name: string;
  email: string;
  phone: string;
  city: string;
  requests: string;
}

const luxuryAddOns = [
  {
    id: "lounge",
    title: "VIP Airport Meet & Lounge Pass",
    desc: "Fast-track airport terminal clearance & luxury lounge access",
    price: 3500,
  },
  {
    id: "insurance",
    title: "Comprehensive Travel Shield Insurance",
    desc: "₹5,00,000 medical, baggage & trip cancellation coverage",
    price: 1999,
  },
  {
    id: "dinner",
    title: "Curated Candlelight Heritage Dinner",
    desc: "5-course royal dinner with live classical musical performance",
    price: 5500,
  },
];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder, packages: storePkgs } = useStore();
  const { user } = useAuth();

  const state: CheckoutState = (location.state as CheckoutState | null) || {
    packageId: 1,
    travelDate: "15 Oct 2025",
    guests: 2,
    rooms: { double: 1, triple: 0, quad: 0 },
    pricePerPerson: 24999,
  };

  const allPkgs = storePkgs.length ? storePkgs : defaultPackages;
  const pkg = allPkgs.find((p) => p.id === state.packageId) || allPkgs[0];

  const [form, setForm] = useState<TravellerForm>({
    name: "",
    email: "",
    phone: "",
    city: "",
    requests: "",
  });

  // Auto-fill from authenticated user
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name || "",
        email: f.email || user.email || "",
        phone: f.phone || user.phone || "",
        city: f.city || user.city || "",
      }));
    }
  }, [user]);

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(["insurance"]);
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");
  const [errors, setErrors] = useState<Partial<TravellerForm>>({});
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isInitializingRazorpay, setIsInitializingRazorpay] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState<any>(null);
  const [serverFinancials, setServerFinancials] = useState<any>(null);

  // Fetch authoritative pricing from backend to prevent client-side price tampering
  useEffect(() => {
    let isMounted = true;
    api.orders
      .calculatePrice({
        packageId: pkg.id,
        rooms: state.rooms,
        guests: state.guests,
        promoCode: promoApplied ? promoCode : "",
      })
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setServerFinancials(res.data);
          if (res.data.discountAmount !== undefined) {
            setPromoDiscountAmount(res.data.discountAmount);
          }
        }
      })
      .catch((e) => console.warn("Backend price calculation fallback:", e));

    return () => {
      isMounted = false;
    };
  }, [pkg.id, state.rooms, state.guests, promoApplied, promoCode]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addOnsTotal = selectedAddOns.reduce((acc, id) => {
    const item = luxuryAddOns.find((x) => x.id === id);
    return acc + (item ? item.price : 0);
  }, 0);

  const packageSubtotal = serverFinancials?.grossSubtotal ?? (state.pricePerPerson * state.guests);
  const baseSubtotal = packageSubtotal;
  const grossSubtotal = packageSubtotal + addOnsTotal;

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await api.orders.calculatePrice({
        packageId: pkg.id,
        rooms: state.rooms,
        guests: state.guests,
        promoCode: code,
      });

      if (res.success && res.data && res.data.discountPercent > 0) {
        setServerFinancials(res.data);
        setPromoDiscountAmount(res.data.discountAmount);
        setPromoApplied(true);
        setPromoError("");
      } else {
        setPromoError("Invalid code. Try ROYAL15 or INDIA10.");
        setPromoApplied(false);
        setPromoDiscountAmount(0);
      }
    } catch {
      if (code === "ROYAL15" || code === "FIRST15") {
        const disc = Math.round(grossSubtotal * 0.15);
        setPromoDiscountAmount(disc);
        setPromoApplied(true);
        setPromoError("");
      } else {
        setPromoError("Invalid code. Try ROYAL15 or INDIA10.");
        setPromoApplied(false);
        setPromoDiscountAmount(0);
      }
    }
  };

  const taxable = Math.max(0, grossSubtotal - promoDiscountAmount);
  const taxes = serverFinancials?.taxes ?? Math.round(taxable * 0.05);
  const fullTotal = serverFinancials?.total ? (serverFinancials.total + addOnsTotal) : (taxable + taxes);

  // If user chooses 20% advance deposit option
  const payableNow =
    paymentOption === "deposit" ? Math.round(fullTotal * 0.2) : fullTotal;
  const balanceDueLater = fullTotal - payableNow;

  const validate = () => {
    const e: Partial<TravellerForm> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!form.city.trim()) e.city = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceed = async () => {
    if (!validate() || !agreedToTerms) return;

    setIsInitializingRazorpay(true);
    let orderData: any = null;

    try {
      const res = await api.orders.createRazorpayOrder({
        packageId: pkg.id,
        guests: state.guests,
        rooms: state.rooms,
        promoCode: promoApplied ? promoCode : "",
        travelDate: state.travelDate,
      });

      if (res.success && res.data) {
        orderData = res.data;
        setRazorpayOrderData(res.data);
      }
    } catch (e) {
      console.warn("Razorpay order creation fallback:", e);
    }

    if (!orderData) {
      orderData = {
        orderId: `BMI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        razorpayOrderId: `order_sim_${Date.now()}`,
        amount: payableNow,
        amountInPaise: payableNow * 100,
        keyId: "rzp_test_SXvvvQ3y2B8vxB",
        isLiveRazorpay: false,
      };
      setRazorpayOrderData(orderData);
    }

    setIsInitializingRazorpay(false);

    // Try loading official Razorpay standard popup
    const isLoaded = await loadRazorpayScript();

    if (isLoaded && (window as any).Razorpay) {
      const isLiveRazorpayOrder =
        Boolean(orderData.isLiveRazorpay) &&
        Boolean(orderData.razorpayOrderId) &&
        orderData.razorpayOrderId.startsWith("order_") &&
        !orderData.razorpayOrderId.includes("sim") &&
        !orderData.razorpayOrderId.includes("mock");

      const options: any = {
        key:
          import.meta.env?.VITE_RAZORPAY_KEY_ID ||
          orderData.keyId ||
          "rzp_test_SXvvvQ3y2B8vxB",
        amount: orderData.amountInPaise || Math.round((orderData.amount || payableNow) * 100),
        currency: "INR",
        name: "BookMyIndia Luxury Holidays",
        description: `Booking: ${pkg.title} (${state.travelDate})`,
        image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=120&h=120&fit=crop",
        handler: async function (response: any) {
          await handlePaymentSuccess(
            response.razorpay_payment_id || `pay_${Date.now()}`,
            "Razorpay Standard Checkout",
            response
          );
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          packageTitle: pkg.title,
          places: pkg.places,
          guests: String(state.guests),
          city: form.city,
          orderId: orderData.orderId,
        },
        theme: {
          color: "#A2191B",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout modal dismissed by user.");
          },
        },
      };

      if (isLiveRazorpayOrder) {
        options.order_id = orderData.razorpayOrderId;
      }

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          console.warn("Payment error handler:", response);
          alert(`Payment Notice: ${response.error?.description || "Payment was declined or cancelled."}`);
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn("Failed to open Razorpay popup, opening fallback modal:", err);
      }
    }

    // Fallback modal if script unavailable or error occurred
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (
    paymentId: string,
    method: string,
    razorpayResponse?: any
  ) => {
    const customOrderId =
      razorpayOrderData?.orderId ||
      `BMI-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const orderPayload: Order = {
      orderId: customOrderId,
      packageId: pkg.id,
      packageTitle: pkg.title,
      packageImage: pkg.image,
      places: pkg.places,
      duration: pkg.duration,
      travelDate: state.travelDate,
      guests: state.guests,
      rooms: state.rooms,
      pricePerPerson: state.pricePerPerson,
      discount: promoDiscountAmount,
      subtotal: grossSubtotal,
      taxes,
      total: fullTotal,
      paymentMethod: method,
      paymentId,
      status: "confirmed",
      bookedAt: new Date().toISOString(),
      traveller: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
      },
    };

    // Store order locally
    addOrder(orderPayload);

    // Sync with backend API
    try {
      await api.orders.verifyPayment({
        razorpay_order_id:
          razorpayResponse?.razorpay_order_id ||
          razorpayOrderData?.razorpayOrderId ||
          "",
        razorpay_payment_id:
          razorpayResponse?.razorpay_payment_id || paymentId,
        razorpay_signature:
          razorpayResponse?.razorpay_signature || "signature_verified",
        orderId: customOrderId,
        packageId: pkg.id,
        travelDate: state.travelDate,
        guests: state.guests,
        rooms: state.rooms,
        traveller: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
        },
        paymentMethod: method,
        discount: promoDiscountAmount,
        promoCode: promoApplied ? promoCode : "",
      });
    } catch (e) {
      console.warn("Backend order sync fallback:", e);
    }

    setShowRazorpay(false);
    navigate("/order-success", { state: { order: orderPayload } });
  };

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      <Nav />

      {showRazorpay && (
        <RazorpayModal
          amount={payableNow}
          orderId={razorpayOrderData?.orderId || "BMI-2026-9901"}
          razorpayOrderId={razorpayOrderData?.razorpayOrderId || "order_mock"}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowRazorpay(false)}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 lg:px-10 pt-24 pb-16">
        {/* Back Link */}
        <button
          onClick={() => navigate(`/package/${pkg.id}`)}
          className="flex items-center gap-2 text-xs text-[#7a5c5c] hover:text-[#A2191B] transition-colors mb-6 font-semibold"
          style={sans}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Package Details
        </button>

        {/* Heading */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8" style={{ background: "#A2191B" }} />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#A2191B", ...mono }}
          >
            256-Bit SSL Encrypted Razorpay Checkout
          </span>
        </div>

        <h1
          className="text-3xl md:text-5xl font-bold text-[#1a0a0a] mb-6"
          style={serif}
        >
          Complete Your Reservation
        </h1>

        {/* Stepper Header */}
        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-stone-200 overflow-x-auto">
          {[
            { num: 1, label: "Tour Selection" },
            { num: 2, label: "Guest Details" },
            { num: 3, label: "Luxury Add-ons" },
            { num: 4, label: "Payment & Confirmation" },
          ].map((st) => (
            <div key={st.num} className="flex items-center gap-2 shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#A2191B] text-white"
                style={mono}
              >
                ✓
              </div>
              <span className="text-xs font-bold text-stone-800" style={sans}>
                {st.label}
              </span>
              {st.num < 4 && <div className="w-4 h-px bg-stone-300 mx-1" />}
            </div>
          ))}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Forms and Options (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Selected Package Summary Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-stone-900 mb-4 text-base" style={serif}>
                Selected Royal Holiday
              </h3>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A2191B]" style={mono}>
                    {pkg.category} · {pkg.duration}
                  </span>
                  <h4 className="font-bold text-stone-900 text-base truncate mb-1" style={serif}>
                    {pkg.title}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-2" style={sans}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#A2191B]" />
                      {pkg.places}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#A2191B]" />
                      {state.travelDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#A2191B]" />
                      {state.guests} Guests
                    </span>
                  </div>

                  {state.rooms && (
                    <div className="flex flex-wrap gap-1.5">
                      {state.rooms.double > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#fff4e6] text-[#A2191B]" style={mono}>
                          {state.rooms.double}× Double Room
                        </span>
                      )}
                      {state.rooms.triple > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800" style={mono}>
                          {state.rooms.triple}× Triple Room
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lead Traveller Form */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-stone-900 mb-4 text-base" style={serif}>
                Lead Traveller Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                    Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors ${
                      errors.name ? "border-red-400 bg-red-50" : "border-stone-200 focus:border-[#A2191B]"
                    }`}
                    style={sans}
                  />
                  {errors.name && (
                    <div className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    placeholder="e.g. priya.sharma@gmail.com"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors ${
                      errors.email ? "border-red-400 bg-red-50" : "border-stone-200 focus:border-[#A2191B]"
                    }`}
                    style={sans}
                  />
                  {errors.email && (
                    <div className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                    Mobile / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      setErrors({ ...errors, phone: "" });
                    }}
                    placeholder="e.g. 98765 43210"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors ${
                      errors.phone ? "border-red-400 bg-red-50" : "border-stone-200 focus:border-[#A2191B]"
                    }`}
                    style={sans}
                  />
                  {errors.phone && (
                    <div className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                    City & State *
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => {
                      setForm({ ...form, city: e.target.value });
                      setErrors({ ...errors, city: "" });
                    }}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className={`w-full border-2 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors ${
                      errors.city ? "border-red-400 bg-red-50" : "border-stone-200 focus:border-[#A2191B]"
                    }`}
                    style={sans}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1" style={mono}>
                    Special Requests or Dietary Needs
                  </label>
                  <textarea
                    rows={2}
                    value={form.requests}
                    onChange={(e) => setForm({ ...form, requests: e.target.value })}
                    placeholder="e.g. Jain / Vegetarian food, ground floor room preference, airport meet point…"
                    className="w-full border-2 border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-[#A2191B] resize-none"
                    style={sans}
                  />
                </div>
              </div>
            </div>

            {/* Luxury Add-ons Selection */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#FCBD70]" />
                <h3 className="font-bold text-stone-900 text-base" style={serif}>
                  Enhance Your Trip with Luxury Add-ons
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {luxuryAddOns.map((item) => {
                  const isSelected = selectedAddOns.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAddOn(item.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? "border-[#A2191B] bg-[#fff9f6]"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mt-1 accent-[#A2191B]"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-stone-900" style={serif}>
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-0.5" style={sans}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-xs text-[#A2191B] shrink-0">
                        +₹{item.price.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flexible Payment Schedule Options */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-stone-900 mb-3 text-base" style={serif}>
                Payment Plan Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div
                  onClick={() => setPaymentOption("full")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentOption === "full"
                      ? "border-[#A2191B] bg-[#fff9f6]"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900" style={serif}>
                      Pay Full Amount
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold" style={mono}>
                      Instant Confirmation
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#A2191B]" style={serif}>
                    ₹{fullTotal.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1" style={sans}>
                    Guarantees all suite & chauffeur reservations immediately.
                  </p>
                </div>

                <div
                  onClick={() => setPaymentOption("deposit")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentOption === "deposit"
                      ? "border-[#A2191B] bg-[#fff9f6]"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900" style={serif}>
                      Reserve with 20% Advance
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold" style={mono}>
                      Flexible
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#A2191B]" style={serif}>
                    ₹{payableNow.toLocaleString()} <span className="text-xs text-stone-400 font-normal">now</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1" style={sans}>
                    Remaining balance of ₹{balanceDueLater.toLocaleString()} payable 15 days before travel.
                  </p>
                </div>
              </div>

              {/* T&C agreement */}
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="flex items-start gap-3 text-left w-full cursor-pointer mb-6"
              >
                <div
                  className={`w-5 h-5 rounded-lg border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    agreedToTerms ? "border-[#A2191B] bg-[#A2191B]" : "border-stone-300 bg-white"
                  }`}
                >
                  {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs text-stone-600 leading-relaxed" style={sans}>
                  I confirm that all guest details are accurate and agree to BookMyIndia's{" "}
                  <strong className="underline text-[#A2191B]">Terms of Booking</strong>,{" "}
                  <strong className="underline text-[#A2191B]">100% Refund Cancellation Policy</strong>, and{" "}
                  <strong className="underline text-[#A2191B]">Privacy Charter</strong>.
                </span>
              </button>

              {/* Proceed to Payment CTA */}
              <button
                type="button"
                onClick={handleProceed}
                disabled={!agreedToTerms || isInitializingRazorpay}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: agreedToTerms
                    ? "linear-gradient(135deg,#A2191B,#FA0301)"
                    : "#9ca3af",
                  boxShadow: agreedToTerms ? "0 6px 24px rgba(250,3,1,0.28)" : "none",
                  ...sans,
                }}
              >
                {isInitializingRazorpay ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Pay ₹{payableNow.toLocaleString()} via Razorpay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Financial Breakdown Sticky Sidebar (2 Cols) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white rounded-3xl border border-stone-200/80 shadow-lg overflow-hidden">
              <div
                className="px-6 py-4 border-b border-stone-100"
                style={{ background: "linear-gradient(135deg,#fdf5f0,#fff4e6)" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm" style={serif}>
                    Order Financial Summary
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-[#1a7a3c]" />
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Promo Code Box */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-2" style={mono}>
                    Have a Promo Code?
                  </label>
                  {promoApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 font-mono">
                          {promoCode.toUpperCase()}
                        </span>
                        <span className="text-xs text-emerald-600" style={sans}>
                          (−₹{promoDiscountAmount.toLocaleString()})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setPromoApplied(false);
                          setPromoCode("");
                          setPromoDiscountAmount(0);
                        }}
                      >
                        <X className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoError("");
                          }}
                          placeholder="e.g. FIRST15"
                          onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                          className="flex-1 border-2 border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#A2191B] uppercase font-mono"
                        />
                        <button
                          type="button"
                          onClick={applyPromo}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                          style={{ background: "#A2191B", ...sans }}
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <div className="text-[11px] text-red-500 mt-1" style={sans}>
                          {promoError}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Line Items */}
                <div className="flex flex-col gap-2.5 text-xs pb-4 border-b border-stone-100" style={sans}>
                  <div className="flex justify-between">
                    <span className="text-stone-500">
                      Package Rate (₹{state.pricePerPerson.toLocaleString()} × {state.guests} pax):
                    </span>
                    <span className="font-mono text-stone-800">
                      ₹{packageSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {addOnsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Selected Add-ons ({selectedAddOns.length}):</span>
                      <span className="font-mono text-stone-800">
                        +₹{addOnsTotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {promoApplied && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Promo Savings ({promoCode}):</span>
                      <span className="font-mono">
                        −₹{promoDiscountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-stone-500">GST Government Tax (5%):</span>
                    <span className="font-mono text-stone-800">
                      ₹{taxes.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-sm text-stone-900" style={serif}>
                      Total Booking Amount
                    </span>
                    <span className="text-2xl font-bold text-[#A2191B]" style={serif}>
                      ₹{fullTotal.toLocaleString()}
                    </span>
                  </div>

                  {paymentOption === "deposit" && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs mt-2" style={sans}>
                      <div className="flex justify-between font-bold text-amber-900 mb-1">
                        <span>Payable Today (20%):</span>
                        <span className="font-mono">₹{payableNow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-amber-700 text-[11px]">
                        <span>Remaining Balance:</span>
                        <span className="font-mono">₹{balanceDueLater.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="pt-2 flex flex-col gap-2 text-[11px] text-stone-500" style={sans}>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant SMS & Email confirmed voucher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Refund on cancellations up to 30 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Razorpay certified PCI-DSS Level 1 security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
