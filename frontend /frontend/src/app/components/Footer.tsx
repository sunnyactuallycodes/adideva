import { Link } from "react-router";
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "'DM Sans', sans-serif" };

export default function Footer() {
  return (
    <footer style={{ background: "#120505" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
                style={{ background: "linear-gradient(135deg,#A2191B,#FA0301)" }}
              >
                <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg" style={{ ...serif, color: "white" }}>
                BookMy<span style={{ color: "#FCBD70" }}>India</span>
              </span>
            </Link>
            <p
              className="text-white/40 text-sm leading-relaxed max-w-xs mb-5 font-light"
              style={sans}
            >
              Crafting unforgettable royal journeys across India's most spectacular destinations since 2015.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-[#FCBD70] transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-10">
            <div>
              <h4 className="text-white text-sm font-semibold mb-4" style={sans}>
                Destinations
              </h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  { name: "Rajasthan", to: "/packages" },
                  { name: "Kerala Backwaters", to: "/packages" },
                  { name: "Himachal & Himalayas", to: "/packages" },
                  { name: "Kashmir Paradise", to: "/packages" },
                  { name: "Goa & Konkan Coast", to: "/packages" },
                  { name: "Andaman Islands", to: "/packages" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.to}
                      className="text-white/40 text-sm hover:text-[#FCBD70] transition-colors"
                      style={sans}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4" style={sans}>
                Luxury Services
              </h4>
              <ul className="flex flex-col gap-2.5">
                {[
                  { name: "All Tour Packages", to: "/packages" },
                  { name: "Plan Custom Itinerary", to: "/plan-trip" },
                  { name: "My Bookings & Portal", to: "/my-orders" },
                  { name: "Admin Dashboard", to: "/admin" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.to}
                      className="text-white/40 text-sm hover:text-[#FCBD70] transition-colors"
                      style={sans}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 py-6 border-y border-white/8 mb-6">
          <a
            href="tel:+911800123456"
            className="flex items-center gap-2 text-white/40 text-sm hover:text-white/70 transition-colors"
            style={sans}
          >
            <Phone className="w-3.5 h-3.5" style={{ color: "#FCBD70" }} />
            1800-123-4567 (Toll Free Concierge)
          </a>
          <a
            href="mailto:hello@bookmyindia.com"
            className="flex items-center gap-2 text-white/40 text-sm hover:text-white/70 transition-colors"
            style={sans}
          >
            <Mail className="w-3.5 h-3.5" style={{ color: "#FCBD70" }} />
            hello@bookmyindia.com
          </a>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs" style={sans}>
            © 2026 BookMyIndia Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Use", "Cancellation Charter"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-white/20 text-xs hover:text-white/50 transition-colors"
                style={sans}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
