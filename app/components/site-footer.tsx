import { Link } from "react-router";
import { SITE } from "../lib/site";
import { Icon } from "./icons";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink-900 text-white/70">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-extrabold text-white">
            <span className="text-teal-400">STLTH</span> Pawn
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">
            Short-term asset loans across {SITE.areas.slice(0, -1).join(", ")} and {SITE.areas.at(-1)}.
            Borrow against what you already own.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="transition-colors hover:text-teal-400" to="/">Home</Link></li>
            <li><Link className="transition-colors hover:text-teal-400" to="/services">Services</Link></li>
            <li><Link className="transition-colors hover:text-teal-400" to="/apply">Apply now</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Get in touch</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="inline-flex items-center gap-2 transition-colors hover:text-teal-400" href={SITE.phoneHref}>
                <Icon.phone className="h-4 w-4 text-teal-400" /> {SITE.phone}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 transition-colors hover:text-teal-400" href={`mailto:${SITE.email}`}>
                <Icon.mail className="h-4 w-4 text-teal-400" /> {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Loans are secured against your asset. Terms apply.</p>
        </div>
      </div>
    </footer>
  );
}
