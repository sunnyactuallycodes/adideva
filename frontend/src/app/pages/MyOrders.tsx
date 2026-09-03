import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  Download,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  Phone,
  Star,
  Package,
  TrendingUp,
  Plane,
  AlertTriangle,
  RefreshCw,
  Printer,
  Search,
  MessageSquare,
  Sparkles,
  Eye,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useStore } from "../store";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../data";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

type StatusFilter = "all" | "confirmed" | "completed" | "cancelled" | "pending";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<
    Order["status"],
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    confirmed: {
      label: "Confirmed / Upcoming",
      bg: "#e6f4ec",
      text: "#1a7a3c",
      icon: <Check className="w-3 h-3" />,
    },
    completed: {
      label: "Completed",
      bg: "#e8f0ff",
      text: "#1a5cbf",
      icon: <Check className="w-3 h-3" />,
    },
    pending: {
      label: "Pending",
      bg: "#fff8e6",
      text: "#8B6914",
      icon: <RefreshCw className="w-3 h-3" />,
    },
    cancelled: {
      label: "Cancelled",
      bg: "#fde8e8",
      text: "#A2191B",
      icon: <X className="w-3 h-3" />,
    },
  };
  const s = map[status] || map.confirmed;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text, ...sans }}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

function PaymentMethodIcon({ method }: { method: string }) {
  const map: Record<string, string> = {
    UPI: "📱",
    "Credit Card": "💳",
    "Debit Card": "💳",
    "Net Banking": "🏦",
    Wallet: "👛",
  };
  return <span className="text-base">{map[method] || "💳"}</span>;
}

function OrderCard({
  order,
  onCancel,
  onPrint,
}: {
  order: Order;
  onCancel: (o: Order) => void;
  onPrint: (o: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const canCancel = order.status === "confirmed" || order.status === "pending";

  return (
    <div
      className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 ${
        expanded
          ? "border-[#A2191B]/25 shadow-md"
          : "border-stone-200 hover:border-stone-300 hover:shadow-xs"
      }`}
    >
      {/* Main Row */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Image */}
          <div
            className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-[#f5f0eb] cursor-pointer"
            onClick={() => navigate(`/package/${order.packageId}`)}
          >
            <img
              src={order.packageImage}
              alt={order.packageTitle}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <h3
                  className="font-bold text-[#1a0a0a] text-lg leading-snug cursor-pointer hover:text-[#A2191B] transition-colors"
                  style={serif}
                  onClick={() => navigate(`/package/${order.packageId}`)}
                >
                  {order.packageTitle}
                </h3>
                <div
                  className="text-xs font-mono font-bold text-stone-400 mt-0.5"
                  style={mono}
                >
                  Booking ID: {order.orderId}
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div
              className="flex flex-wrap gap-4 text-xs text-[#7a5c5c] mb-4"
              style={sans}
            >
              <span className="flex items-center gap-1">
                <MapPin
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#A2191B" }}
                />
                {order.places}
              </span>
              <span className="flex items-center gap-1">
                <Clock
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#A2191B" }}
                />
                {order.duration}
              </span>
              <span className="flex items-center gap-1">
                <Calendar
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#A2191B" }}
                />
                {order.travelDate}
              </span>
              <span className="flex items-center gap-1">
                <Users
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#A2191B" }}
                />
                {order.guests} {order.guests === 1 ? "person" : "persons"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <PaymentMethodIcon method={order.paymentMethod} />
                <span style={sans}>
                  {order.paymentMethod || "Razorpay"} (
                  <span className="font-mono text-stone-700">
                    {order.paymentId || "pay_verified"}
                  </span>
                  )
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-400" style={mono}>
                    Total Paid
                  </div>
                  <div
                    className="text-xl font-bold font-mono text-[#A2191B]"
                    style={serif}
                  >
                    ₹{order.total.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600"
                >
                  {expanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Accordion Details */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-stone-100 bg-stone-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2"
                style={mono}
              >
                Traveller Particulars
              </div>
              <div className="flex flex-col gap-1.5 text-xs" style={sans}>
                <div className="flex justify-between">
                  <span className="text-stone-400">Lead Name:</span>
                  <span className="font-semibold text-stone-800">
                    {order.traveller?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Email:</span>
                  <span className="font-semibold text-stone-800">
                    {order.traveller?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Phone:</span>
                  <span className="font-semibold text-stone-800">
                    {order.traveller?.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">City:</span>
                  <span className="font-semibold text-stone-800">
                    {order.traveller?.city || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2"
                style={mono}
              >
                Price & Invoice
              </div>
              <div className="flex flex-col gap-1.5 text-xs" style={sans}>
                <div className="flex justify-between">
                  <span className="text-stone-400">Package Rate:</span>
                  <span className="font-mono text-stone-700">
                    ₹{order.pricePerPerson?.toLocaleString()} / person
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Subtotal:</span>
                  <span className="font-mono text-stone-700">
                    ₹{order.subtotal?.toLocaleString()}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono">
                      −₹{order.discount?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-400">GST (5%):</span>
                  <span className="font-mono text-stone-700">
                    ₹{order.taxes?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200/80">
            <div className="flex gap-2">
              <button
                onClick={() => onPrint(order)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-xs font-bold text-stone-700 transition-colors shadow-xs"
                style={sans}
              >
                <Printer className="w-3.5 h-3.5 text-[#A2191B]" />
                Print Voucher
              </button>

              <button
                onClick={() => navigate(`/package/${order.packageId}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-xs font-bold text-stone-700 transition-colors shadow-xs"
                style={sans}
              >
                <Eye className="w-3.5 h-3.5" />
                View Package Itinerary
              </button>
            </div>

            {canCancel && (
              <button
                onClick={() => onCancel(order)}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
                style={sans}
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, refreshOrders } = useStore();
  const { user } = useAuth();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

  useEffect(() => {
    refreshOrders();
  }, []);

  const confirmed = orders.filter((o) => o.status === "confirmed").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch =
      !search ||
      o.packageTitle?.toLowerCase().includes(search.toLowerCase()) ||
      o.orderId?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    await updateOrderStatus(cancellingOrder.orderId, "cancelled");
    setCancellingOrder(null);
  };

  const handlePrintVoucher = (order: Order) => {
    navigate("/order-success", { state: { order } });
  };

  const filterTabs: { id: StatusFilter; label: string; count: number }[] = [
    { id: "all", label: "All Bookings", count: orders.length },
    {
      id: "confirmed",
      label: "Upcoming",
      count: orders.filter((o) => o.status === "confirmed").length,
    },
    {
      id: "completed",
      label: "Completed",
      count: orders.filter((o) => o.status === "completed").length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      <Nav />

      <div className="max-w-6xl mx-auto px-5 lg:px-10 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-7" style={{ background: "#A2191B" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#A2191B", ...mono }}
              >
                Traveller Account Portal
              </span>
            </div>
            <h1
              className="text-3xl md:text-5xl font-bold text-[#1a0a0a]"
              style={serif}
            >
              My Bookings & Trips
            </h1>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform shrink-0"
            style={{
              background: "linear-gradient(135deg,#A2191B,#FA0301)",
              ...sans,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Book Another Tour
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Package,
              label: "Total Reservations",
              value: String(orders.length),
              color: "#A2191B",
            },
            {
              icon: Plane,
              label: "Upcoming Trips",
              value: String(confirmed),
              color: "#1a5cbf",
            },
            {
              icon: Check,
              label: "Completed Tours",
              value: String(completed),
              color: "#1a7a3c",
            },
            {
              icon: TrendingUp,
              label: "Total Investment",
              value: `₹${(totalSpent / 1000).toFixed(0)}K`,
              color: "#8B6914",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `${color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div
                className="text-2xl font-bold mb-0.5"
                style={{ color, ...serif }}
              >
                {value}
              </div>
              <div className="text-xs text-stone-500 font-medium" style={sans}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full" style={{ scrollbarWidth: "none" }}>
            {filterTabs.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all border ${
                  filter === id
                    ? "text-white border-transparent shadow-md"
                    : "text-stone-600 border-stone-200 bg-white hover:border-stone-400"
                }`}
                style={{
                  background:
                    filter === id
                      ? "linear-gradient(135deg,#A2191B,#FA0301)"
                      : undefined,
                  ...mono,
                }}
              >
                {label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    filter === id
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white border-2 border-stone-200 rounded-2xl px-4 py-2 focus-within:border-[#A2191B] transition-colors w-full sm:w-64 shadow-xs">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings…"
              className="w-full text-xs outline-none text-stone-700 bg-transparent"
              style={sans}
            />
          </div>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-xs">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: "#fff4e6" }}
            >
              <ShoppingBag className="w-8 h-8" style={{ color: "#A2191B" }} />
            </div>
            <h3 className="text-xl font-bold text-[#1a0a0a] mb-2" style={serif}>
              No Bookings Found
            </h3>
            <p className="text-xs text-[#7a5c5c] mb-6" style={sans}>
              You have no active {filter !== "all" ? filter : ""} bookings on record.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg,#A2191B,#FA0301)",
                ...sans,
              }}
            >
              Explore Royal Holiday Packages
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onCancel={(o) => setCancellingOrder(o)}
                onPrint={handlePrintVoucher}
              />
            ))}
          </div>
        )}

        {/* 24/7 Concierge Banner */}
        <div className="mt-12 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#1a0a0a] text-lg mb-1" style={serif}>
                Dedicated 24/7 Trip Concierge
              </h3>
              <p className="text-xs text-[#7a5c5c]" style={sans}>
                Have a query regarding flight connections, dietary requirements, or room upgrades?
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+911800123456"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2 border-[#A2191B]/25 text-[#A2191B] hover:border-[#A2191B] transition-colors"
                style={sans}
              >
                <Phone className="w-3.5 h-3.5" />
                1800-123-4567
              </a>
              <a
                href="mailto:concierge@bookmyindia.com"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg,#A2191B,#FA0301)",
                  ...sans,
                }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Contact Concierge
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancellingOrder && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2" style={serif}>
              Cancel Reservation?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-6" style={sans}>
              Are you sure you want to cancel your booking for{" "}
              <strong>{cancellingOrder.packageTitle}</strong> (Order ID:{" "}
              <span className="font-mono">{cancellingOrder.orderId}</span>)? Per our 100% refund policy, eligible refunds will be initiated within 7 days.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
                style={sans}
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md"
                style={sans}
              >
                Yes, Cancel Tour
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
