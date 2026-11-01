import { Link } from "react-router";
import type { Route } from "./+types/services";
import { Icon } from "../components/icons";
import { useReveal } from "../lib/use-reveal";
import { FEES, SITE } from "../lib/site";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Services — STLTH Pawn" },
    {
      name: "description",
      content:
        "Short-term loans against cars, motorbikes, caravans and trailers. Up to 60% of your asset's value for up to 3 months, with pickup and redelivery.",
    },
  ];
}

const SERVICES = [
  { icon: Icon.car, title: "Car loans", body: "Sedans, utes, 4WDs and vans. Keep your rego and insurance current and we'll do the rest." },
  { icon: Icon.bike, title: "Motorbike loans", body: "Road bikes, dirt bikes and scooters — stored securely and insured while we hold them." },
  { icon: Icon.caravan, title: "Caravan loans", body: "Caravans, campers and pop-tops. Ideal for the quiet months between trips." },
  { icon: Icon.trailer, title: "Trailer loans", body: "Box trailers, car trailers and custom builds. Quick to value, quick to settle." },
];

const REASONS = [
  "An unexpected bill or emergency",
  "A wedding or a holiday",
  "Bridging a gap between pay cycles",
  "Covering business cash flow",
];

export default function Services() {
  useReveal();

  return (
    <>
      <section className="border-b border-ink-500/10 bg-gradient-to-b from-teal-50 to-white">
        <div className="shell py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700" data-reveal>
            Our services
          </p>
          <h1
            className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl"
            data-reveal
            style={{ "--delay": "60ms" } as React.CSSProperties}
          >
            Turn your asset into cash
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500"
            data-reveal
            style={{ "--delay": "120ms" } as React.CSSProperties}
          >
            If you need a loan to fund a wedding, a holiday or an unexpected emergency, STLTH Pawn
            lends up to {SITE.maxLoanPercent}% of your asset's value for up to {SITE.maxTermMonths} months.
            Ultra short-term loans are our speciality.
          </p>
        </div>
      </section>

      <section className="shell py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {SERVICES.map((service, i) => (
            <article
              key={service.title}
              className="card group flex flex-col p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-900/5"
              data-reveal
              style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                <service.icon className="h-7 w-7" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold text-ink-900">{service.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{service.body}</p>
              <Link
                to="/apply"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
              >
                Apply for this
                <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="shell grid gap-10 pb-16 lg:grid-cols-2">
        <div className="card p-7 sm:p-9" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">The details</p>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-900">How a loan works</h2>
          <ul className="mt-6 space-y-4">
            {[
              `We lend up to ${SITE.maxLoanPercent}% of the value of your asset.`,
              `Loan terms run up to ${SITE.maxTermMonths} months.`,
              "We can pick up your asset and redeliver it when you repay.",
              "Your asset is held securely for the duration of the loan.",
              "No credit checks and no application fee, ever.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-700">
                <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal style={{ "--delay": "90ms" } as React.CSSProperties}>
          <div className="card p-7 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Fees</p>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-900">No surprises</h2>
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
          </div>

          <div className="mt-6 rounded-card bg-ink-900 p-7 text-white sm:p-9">
            <h3 className="font-display text-lg font-bold">People borrow from us for</h3>
            <ul className="mt-4 space-y-2.5">
              {REASONS.map((reason) => (
                <li key={reason} className="flex gap-3 text-sm text-white/70">
                  <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                  {reason}
                </li>
              ))}
            </ul>
            <Link to="/apply" className="btn btn-primary mt-7 w-full py-3.5">
              Start your application <Icon.arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
