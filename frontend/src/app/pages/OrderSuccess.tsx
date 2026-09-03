import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Check,
  MapPin,
  Calendar,
  Users,
  Clock,
  Download,
  ShoppingBag,
  Phone,
  Mail,
  Share2,
  Printer,
  Copy,
  CheckCheck,
} from "lucide-react";
import Nav from "../components/Nav";
import type { Order } from "../data";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = (location.state as { order: Order } | null)?.order;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("canvas-confetti").then((mod: any) => {
      const confetti = mod.default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fire = (pO: number, opts: any) =>
        confetti({
          ...opts,
          particleCount: Math.floor(200 * pO),
          spread: 26 * pO,
        });
      const burst = () => {
        fire(0.25, { angle: 55, origin: { x: 0 } });
        fire(0.2, { angle: 60, origin: { x: 0 } });
        fire(0.35, { angle: 115, origin: { x: 1 } });
        fire(0.1, { angle: 120, origin: { x: 1 } });
        fire(0.1, {
          angle: 90,
          origin: { x: 0.5 },
          colors: ["#A2191B", "#FA0301", "#FCBD70", "#ffffff"],
        });
      };
      burst();
      setTimeout(burst, 600);
    });
  }, []);

  const handlePrintVoucher = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `BookMyIndia Booking Confirmed: ${order?.packageTitle}`,
      text: `I just booked "${order?.packageTitle}" on BookMyIndia! Order ID: ${order?.orderId}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      navigator.clipboard.writeText(
        `BookMyIndia Booking: ${order?.packageTitle} (Order ID: ${order?.orderId})`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!order) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#faf8f5" }}
      >
        <div className="text-center">
          <p className="text-[#7a5c5c] mb-4" style={sans}>
            No active booking session found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-full text-white font-semibold"
            style={{ background: "#A2191B", ...sans }}
          >
            Explore Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen print:bg-white" style={{ background: "#faf8f5" }}>
      <div className="print:hidden">
        <Nav />
      </div>

      <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-28 pb-16 print:pt-6 print:px-0">
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-[#A2191B]/10 overflow-hidden shadow-xl mb-6 print:border-none print:shadow-none">
          {/* Top Banner */}
          <div
            className="relative overflow-hidden px-8 py-10 text-center"
            style={{
              background:
                "linear-gradient(135deg,#A2191B 0%,#8B1214 60%,#1a0a0a 100%)",
            }}
          >
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
              style={{ background: "#FCBD70" }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: "#FA0301" }}
            />
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2" style={serif}>
                Booking Confirmed!
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mb-5" style={sans}>
                A confirmation voucher and receipt have been dispatched to{" "}
                <span className="text-white font-medium">
                  {order.traveller.email}
                </span>
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20">
                <span className="text-white/60 text-xs" style={mono}>
                  Order ID
                </span>
                <span className="text-white font-bold text-sm tracking-wider" style={mono}>
                  {order.orderId}
                </span>
              </div>
            </div>
          </div>

          {/* Package Summary */}
          <div className="p-6 border-b border-[#A2191B]/8">
            <div className="flex gap-4">
              <div className="w-24 h-20 rounded-2xl overflow-hidden shrink-0 bg-[#f5f0eb]">
                <img
                  src={order.packageImage}
                  alt={order.packageTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div
                  className="font-bold text-[#1a0a0a] text-lg mb-1.5"
                  style={serif}
                >
                  {order.packageTitle}
                </div>
                <div
                  className="flex flex-wrap gap-3 text-xs text-[#7a5c5c]"
                  style={sans}
                >
                  <span className="flex items-center gap-1">
                    <MapPin
                      className="w-3 h-3 shrink-0"
                      style={{ color: "#A2191B" }}
                    />
                    {order.places}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock
                      className="w-3 h-3 shrink-0"
                      style={{ color: "#A2191B" }}
                    />
                    {order.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar
                      className="w-3 h-3 shrink-0"
                      style={{ color: "#A2191B" }}
                    />
                    {order.travelDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users
                      className="w-3 h-3 shrink-0"
                      style={{ color: "#A2191B" }}
                    />
                    {order.guests} {order.guests === 1 ? "person" : "persons"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking + Payment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#A2191B]/8">
            <div className="p-6">
              <div
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#7a5c5c", ...mono }}
              >
                Lead Traveller Information
              </div>
              {[
                { label: "Full Name", value: order.traveller.name },
                { label: "Email Address", value: order.traveller.email },
                { label: "Mobile Number", value: order.traveller.phone },
                { label: "City", value: order.traveller.city || "—" },
                { label: "Booked On", value: formatDate(order.bookedAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col mb-3">
                  <span className="text-[11px] text-stone-400" style={sans}>
                    {label}
                  </span>
                  <span
                    className="text-sm font-semibold text-stone-800"
                    style={sans}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6">
              <div
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#7a5c5c", ...mono }}
              >
                Razorpay Payment Receipt
              </div>
              {[
                {
                  label: "Subtotal",
                  value: `₹${order.subtotal?.toLocaleString()}`,
                },
                ...(order.discount
                  ? [
                      {
                        label: "Promo Discount",
                        value: `−₹${order.discount.toLocaleString()}`,
                      },
                    ]
                  : []),
                {
                  label: "GST Tax (5%)",
                  value: `₹${order.taxes?.toLocaleString()}`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center mb-2 text-xs"
                >
                  <span className="text-stone-500" style={sans}>
                    {label}
                  </span>
                  <span
                    className={`font-semibold font-mono ${
                      label.includes("Discount")
                        ? "text-emerald-600"
                        : "text-stone-800"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-stone-200 pt-3 mb-4">
                <span className="text-sm font-bold text-stone-800" style={sans}>
                  Total Paid
                </span>
                <span
                  className="text-2xl font-bold font-mono text-[#A2191B]"
                  style={serif}
                >
                  ₹{order.total?.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#1a7a3c" }}
                  />
                  <span className="text-xs text-stone-500" style={sans}>
                    Method:{" "}
                    <span className="text-stone-800 font-semibold">
                      {order.paymentMethod || "Razorpay / UPI"}
                    </span>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className="w-2 h-2 rounded-full mt-1 shrink-0"
                    style={{ background: "#1a7a3c" }}
                  />
                  <span className="text-xs text-stone-500 font-mono" style={mono}>
                    Payment ID: {order.paymentId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div
            className="p-6 border-t border-[#A2191B]/8 bg-stone-50/60"
          >
            <div
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: "#7a5c5c", ...mono }}
            >
              What Happens Next?
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "01",
                  title: "SMS & Email Voucher",
                  desc: "Instant booking voucher dispatched with reference barcodes.",
                },
                {
                  step: "02",
                  title: "Trip Captain Connect",
                  desc: "Your dedicated personal concierge calls within 24 hours.",
                },
                {
                  step: "03",
                  title: "VIP Pickup Briefing",
                  desc: "Luxury AC vehicle and private chauffeur arrival details sent 48h prior.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <span
                    className="text-xl font-bold shrink-0"
                    style={{ color: "#FCBD70", ...serif }}
                  >
                    {step}
                  </span>
                  <div>
                    <div
                      className="text-xs font-bold text-stone-800 mb-0.5"
                      style={sans}
                    >
                      {title}
                    </div>
                    <div className="text-[11px] text-stone-500 leading-relaxed" style={sans}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="print:hidden flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all hover:scale-[1.01] shadow-md"
            style={{
              background: "linear-gradient(135deg,#A2191B,#FA0301)",
              ...sans,
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View All My Bookings</span>
          </button>
          <button
            onClick={handlePrintVoucher}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[#A2191B] border-2 border-[#A2191B]/30 hover:border-[#A2191B] bg-white transition-colors shadow-xs"
            style={sans}
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Voucher</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-stone-600 border-2 border-stone-200 hover:border-stone-400 bg-white transition-colors shadow-xs"
            style={sans}
          >
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>

        {/* 24/7 Support Footer */}
        <div className="text-center print:hidden">
          <p className="text-xs text-stone-500 mb-2 font-medium" style={sans}>
            Need immediate assistance with your reservation?
          </p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="tel:+911800123456"
              className="flex items-center gap-1.5 text-xs font-bold text-[#A2191B] hover:underline"
              style={sans}
            >
              <Phone className="w-3.5 h-3.5" />
              1800-123-4567 (Toll Free)
            </a>
            <a
              href="mailto:support@bookmyindia.com"
              className="flex items-center gap-1.5 text-xs font-bold text-[#A2191B] hover:underline"
              style={sans}
            >
              <Mail className="w-3.5 h-3.5" />
              support@bookmyindia.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
