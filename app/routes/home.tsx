import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Icon } from "../components/icons";
import { useReveal } from "../lib/use-reveal";
import { ASSETS, FEES, SITE } from "../lib/site";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "STLTH Pawn — Short-term loans against your car, bike, caravan or trailer" },
    {
      name: "description",
      content:
        "Borrow up to 60% of your asset's value across Brisbane, Ipswich, Gold Coast and Toowoomba. No credit checks, no application fee, fast approvals.",
    },
  ];
}

const PROMISES = [
  { icon: Icon.shield, title: "No credit checks", body: "Your asset is the security, so your credit file never comes into it." },
  { icon: Icon.check, title: "No application fee", body: "Applying costs nothing. You only pay if you accept a loan." },
  { icon: Icon.clock, title: "Fast approvals", body: "Send your details and photos today — most applications are answered same day." },
  { icon: Icon.truck, title: "We pick up & redeliver", body: "We can collect your asset and bring it back when the loan is settled." },
];

const STEPS = [
  { n: "01", title: "Send us your asset", body: "Fill in the short form with your details and a few photos of what you're borrowing against." },
  { n: "02", title: "Get your offer", body: "We value your asset and come back with what we can lend — up to 60% of its value." },
  { n: "03", title: "Collect your cash", body: "Accept the offer, hand over the asset, and the money is yours. Repay and it comes straight back." },
];

export default function Home() {
  useReveal();

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-sand-400/20 blur-3xl"
        />

        <div className="shell relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p
              className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700"
              data-reveal
            >
              {SITE.areas.join(" · ")}
            </p>

            <h1
              className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
              data-reveal
              style={{ "--delay": "60ms" } as React.CSSProperties}
            >
              Borrow cash today against your{" "}
              <span className="text-teal-500">car, caravan, trailer or motorbike</span>
            </h1>

            <p
              className="mt-5 max-w-lg text-lg leading-relaxed text-ink-500"
              data-reveal
              style={{ "--delay": "120ms" } as React.CSSProperties}
            >
              We lend up to {SITE.maxLoanPercent}% of your asset's value for up to {SITE.maxTermMonths} months.
              Ultra short-term loans are our speciality — no credit checks, no application fee.
            </p>

            <div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              data-reveal
              style={{ "--delay": "180ms" } as React.CSSProperties}
            >
              <Link to="/apply" className="btn btn-primary px-8 py-3.5 text-base">
                Apply now <Icon.arrow className="h-4 w-4" />
              </Link>
              <a href={SITE.phoneHref} className="btn btn-ghost px-8 py-3.5 text-base">
                <Icon.phone className="h-4 w-4 text-teal-500" /> {SITE.phone}
              </a>
            </div>

            <dl
              className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-ink-500/10 pt-6"
              data-reveal
              style={{ "--delay": "240ms" } as React.CSSProperties}
            >
              {[
                { k: `${SITE.maxLoanPercent}%`, v: "of asset value" },
                { k: "$0", v: "application fee" },
                { k: "Same day", v: "approvals" },
              ].map((stat) => (
                <div key={stat.v}>
                  <dt className="font-display text-2xl font-extrabold text-ink-900">{stat.k}</dt>
                  <dd className="mt-0.5 text-xs leading-snug text-ink-500">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* calculator-ish card */}
          <div className="relative" data-reveal style={{ "--delay": "140ms" } as React.CSSProperties}>
            <div className="card relative overflow-hidden p-7 shadow-xl shadow-teal-900/5 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">What you could borrow</p>
              <p className="mt-3 text-sm text-ink-500">
                We lend up to {SITE.maxLoanPercent}% of what your asset is worth. A rough guide:
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  { worth: "$5,000", loan: "$3,000" },
                  { worth: "$12,000", loan: "$7,200" },
                  { worth: "$25,000", loan: "$15,000" },
                ].map((row) => (
                  <li key={row.worth} className="flex items-center justify-between rounded-xl bg-teal-50/70 px-4 py-3">
                    <span className="text-sm text-ink-500">
                      Asset worth <strong className="font-semibold text-ink-900">{row.worth}</strong>
                    </span>
                    <span className="font-display text-lg font-extrabold text-teal-600">{row.loan}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs leading-relaxed text-ink-500">
                A guide only — the final amount depends on the valuation of your asset.
              </p>

              <Link to="/apply" className="btn btn-primary mt-6 w-full py-3.5">
                Get your valuation <Icon.arrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMISES ── */}
      <section className="shell py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((item, i) => (
            <div
              key={item.title}
              className="card group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-900/5"
              data-reveal
              style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-ink-900 py-20 text-white">
        <div className="shell">
          <div className="max-w-2xl" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Cash in three steps
            </h2>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                className="relative rounded-card border border-white/10 bg-white/5 p-7 transition-all duration-300 hover:border-teal-400/40 hover:bg-white/8"
                data-reveal
                style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
              >
                <span className="font-display text-4xl font-extrabold text-teal-400/40">{step.n}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── ASSETS + FEES ── */}
      <section className="shell grid gap-12 py-20 lg:grid-cols-2">
        <div data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">What we lend against</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900">
            If you own it outright, we can probably lend on it
          </h2>
          <ul className="mt-7 grid grid-cols-2 gap-3">
            {ASSETS.map((asset) => (
              <li
                key={asset.slug}
                className="flex items-center gap-2.5 rounded-xl border border-ink-500/12 px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-teal-500/40 hover:text-teal-700"
              >
                <Icon.check className="h-4 w-4 shrink-0 text-teal-500" />
                {asset.label}
              </li>
            ))}
          </ul>
          <Link to="/services" className="btn btn-ghost mt-7">
            See all services <Icon.arrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="card p-7 sm:p-9" data-reveal style={{ "--delay": "90ms" } as React.CSSProperties}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Our fees</p>
          <h3 className="mt-3 font-display text-2xl font-extrabold text-ink-900">Simple and up front</h3>
          <ul className="mt-6 divide-y divide-ink-500/10">
            {FEES.map((fee) => (
              <li key={fee.term} className="flex items-baseline justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold text-ink-900">{fee.term}</p>
                  <p className="text-sm text-ink-500">{fee.note}</p>
                </div>
                <p className="font-display text-2xl font-extrabold text-teal-600">{fee.rate}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl bg-teal-50 px-4 py-3 text-sm leading-relaxed text-teal-900">
            Loans run for up to {SITE.maxTermMonths} months. There's no application fee and no credit check —
            your asset is the security.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="shell pb-8">
        <div
          className="relative overflow-hidden rounded-card bg-gradient-to-br from-teal-500 to-teal-700 px-8 py-14 text-center text-white sm:px-12"
          data-reveal
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Need cash now?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/85">
            Apply in about two minutes. No obligation, and nothing to pay unless you accept the loan.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/apply" className="btn bg-white px-8 py-3.5 text-base text-teal-700 hover:-translate-y-0.5 hover:bg-teal-50">
              Apply now <Icon.arrow className="h-4 w-4" />
            </Link>
            <a href={SITE.phoneHref} className="btn border border-white/40 px-8 py-3.5 text-base text-white hover:-translate-y-0.5 hover:bg-white/10">
              <Icon.phone className="h-4 w-4" /> Call {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
