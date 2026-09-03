import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  MapPin,
  Menu,
  X,
  ShoppingBag,
  User,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../store";
import { useAuth } from "../context/AuthContext";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

export default function Nav({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(!transparent);
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const { orders } = useStore();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();

  const upcomingCount = orders.filter((o) => o.status === "confirmed").length;

  useEffect(() => {
    if (!transparent) {
      setScrolled(true);
      return;
    }
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, [transparent]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayInitial = (displayName.charAt(0) || "U").toUpperCase();
  const firstName = displayName.split(" ")[0];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-white/96 backdrop-blur-md shadow-sm border-b border-[#A2191B]/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)" }}
          >
            <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ ...serif, color: scrolled ? "#A2191B" : "#fff" }}
          >
            BookMy<span style={{ color: "#FCBD70" }}>India</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {[
            { label: "Packages", to: "/packages" },
            { label: "Destinations", to: "/packages" },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`text-sm font-medium transition-colors hover:text-[#FA0301] ${
                scrolled
                  ? isActive(to)
                    ? "text-[#A2191B] font-semibold"
                    : "text-stone-700"
                  : isActive(to)
                  ? "text-[#FCBD70] font-semibold"
                  : "text-white/90"
              }`}
              style={sans}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/my-orders"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              scrolled
                ? "text-stone-700 hover:text-[#A2191B]"
                : "text-white/90 hover:text-white"
            }`}
            style={sans}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Bookings</span>
            {upcomingCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center -ml-0.5"
                style={{ background: "#FCBD70", color: "#1a0a0a" }}
              >
                {upcomingCount}
              </span>
            )}
          </Link>

          {/* User Auth state button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  scrolled
                    ? "bg-stone-100 text-stone-800 hover:bg-stone-200"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
                style={sans}
              >
                <div
                  className="w-6 h-6 rounded-full overflow-hidden bg-[#A2191B] text-white text-xs font-bold flex items-center justify-center"
                  style={mono}
                >
                  {displayInitial}
                </div>
                <span className="max-w-[90px] truncate">{firstName}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {userDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <div className="text-sm font-bold text-stone-800 truncate" style={serif}>
                      {displayName}
                    </div>
                    <div className="text-xs text-stone-400 truncate" style={sans}>
                      {user.email || ""}
                    </div>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800" style={mono}>
                        ADMIN ACCESS
                      </span>
                    )}
                  </div>

                  <Link
                    to="/my-orders"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-600 hover:bg-stone-50 transition-colors"
                    style={sans}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
                    My Bookings
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-900 font-semibold bg-amber-50/70 hover:bg-amber-100/80 transition-colors"
                      style={sans}
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Admin Control Panel
                    </Link>
                  )}

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left transition-colors font-medium"
                      style={sans}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                scrolled
                  ? "text-[#A2191B] hover:bg-[#A2191B]/8"
                  : "text-white hover:bg-white/10"
              }`}
              style={sans}
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}

          <Link
            to="/plan-trip"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:scale-105 transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)", ...sans }}
          >
            Plan Trip
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 ${scrolled ? "text-[#1a0a0a]" : "text-white"}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-[#A2191B]/10 px-5 py-4 flex flex-col gap-3 shadow-lg">
          {[
            { label: "Home", to: "/" },
            { label: "All Packages", to: "/packages" },
            { label: "Plan Custom Trip", to: "/plan-trip" },
            { label: "My Orders", to: "/my-orders" },
            ...(isAdmin ? [{ label: "🛡️ Admin Panel", to: "/admin" }] : []),
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-sm text-[#1a0a0a] py-1 font-medium"
              style={sans}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-stone-600 font-medium">{displayName}</span>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="text-xs text-red-600 font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  openAuthModal("login");
                }}
                className="w-full py-2.5 rounded-xl bg-[#A2191B] text-white text-xs font-bold"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
