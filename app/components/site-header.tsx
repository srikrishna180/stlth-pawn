import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { SITE } from "../lib/site";
import { Icon } from "./icons";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
  { to: "/apply", label: "Apply now" },
];

export function SiteHeader() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Never leave the mobile menu open behind a route change.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        stuck ? "border-b border-ink-500/10 bg-white/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="shell flex h-18 items-center justify-between gap-4">
        <Link to="/" className="group flex items-baseline gap-1.5" aria-label={`${SITE.name} home`}>
          <span className="font-display text-2xl font-extrabold tracking-tight text-teal-500 transition-colors group-hover:text-teal-600">
            STLTH
          </span>
          <span className="font-display text-lg font-semibold text-ink-900">Pawn</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-teal-50 text-teal-700" : "text-ink-500 hover:text-ink-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={SITE.phoneHref}
            className="hidden items-center gap-2 text-sm font-semibold text-ink-700 transition-colors hover:text-teal-600 sm:flex"
          >
            <Icon.phone className="h-4 w-4 text-teal-500" />
            {SITE.phone}
          </a>
          <Link to="/apply" className="btn btn-primary hidden md:inline-flex">
            Apply now
          </Link>
          <button
            type="button"
            className="btn btn-ghost px-3 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-ink-500/10 bg-white md:hidden" aria-label="Main">
          <div className="shell flex flex-col py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-base font-medium ${
                    isActive ? "bg-teal-50 text-teal-700" : "text-ink-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a href={SITE.phoneHref} className="btn btn-sand mt-3">
              <Icon.phone className="h-4 w-4" /> Call {SITE.phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
