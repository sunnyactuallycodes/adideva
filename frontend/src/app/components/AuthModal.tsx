import { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    register,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Whitespace & Empty Validation
    if (!email || !email.trim()) {
      const msg = "Please enter your email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (email.includes(" ")) {
      const msg = "Email address cannot contain spaces.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const msg = "Please enter a valid email address (e.g. name@domain.com).";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!password) {
      const msg = "Please enter your password.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.startsWith(" ") || password.endsWith(" ")) {
      const msg = "Password cannot contain leading or trailing spaces.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!isLogin) {
      if (!name || !name.trim()) {
        const msg = "Please enter your full name.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (name.trim().length < 2) {
        const msg = "Full name must be at least 2 characters.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (phone && phone.trim() && !/^[0-9+\s-]{8,15}$/.test(phone.trim())) {
        const msg = "Please enter a valid phone number.";
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await login(email.trim(), password);
        if (res.success) {
          toast.success("Welcome back! Logged in successfully.");
          closeAuthModal();
        } else {
          const errMsg =
            res.error ||
            "Invalid email or password. Please check credentials and try again.";
          setError(errMsg);
          toast.error(errMsg);
        }
      } else {
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          city: city.trim(),
        });
        if (res.success) {
          toast.success("Account created successfully! Welcome to BookMyIndia.");
          closeAuthModal();
        } else {
          const errMsg =
            res.error || "Registration failed. Please check details and try again.";
          setError(errMsg);
          toast.error(errMsg);
        }
      }
    } catch (err: any) {
      const errMsg = err.message || "An unexpected error occurred. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,5,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header with decorative brand gradient */}
        <div
          className="relative px-7 py-6 text-white overflow-hidden"
          style={{ background: "linear-gradient(135deg,#A2191B 0%,#FA0301 100%)" }}
        >
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/90" style={mono}>
              BookMyIndia Secure
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1" style={serif}>
            {isLogin ? "Welcome Back" : "Join BookMyIndia"}
          </h2>
          <p className="text-white/80 text-xs" style={sans}>
            {isLogin
              ? "Access your saved packages, bookings, and exclusive deals."
              : "Discover curated royal itineraries across India."}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-100 bg-stone-50">
          <button
            type="button"
            onClick={() => {
              setError("");
              openAuthModal("login");
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              isLogin
                ? "border-[#A2191B] text-[#A2191B] bg-white"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
            style={mono}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              openAuthModal("register");
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              !isLogin
                ? "border-[#A2191B] text-[#A2191B] bg-white"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
            style={mono}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-3.5">
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs" style={sans}>
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                Full Name *
              </label>
              <div className="flex items-center gap-2 border-2 border-stone-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#A2191B] transition-colors">
                <User className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-sm outline-none bg-transparent text-stone-800"
                  style={sans}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
              Email Address *
            </label>
            <div className="flex items-center gap-2 border-2 border-stone-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#A2191B] transition-colors">
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-sm outline-none bg-transparent text-stone-800"
                style={sans}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
              Password *
            </label>
            <div className="flex items-center gap-2 border-2 border-stone-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#A2191B] transition-colors">
              <Lock className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm outline-none bg-transparent text-stone-800"
                style={sans}
                required
                minLength={6}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  Phone
                </label>
                <div className="flex items-center gap-1.5 border-2 border-stone-200 rounded-xl px-3 py-2.5 focus-within:border-[#A2191B] transition-colors">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full text-xs outline-none bg-transparent text-stone-800"
                    style={sans}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 block mb-1" style={mono}>
                  City
                </label>
                <div className="flex items-center gap-1.5 border-2 border-stone-200 rounded-xl px-3 py-2.5 focus-within:border-[#A2191B] transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full text-xs outline-none bg-transparent text-stone-800"
                    style={sans}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 transition-all flex items-center justify-center gap-2 hover:opacity-95 shadow-md disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)", ...sans }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? "Sign In to Account" : "Complete Registration"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
