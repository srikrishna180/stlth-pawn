import { useEffect, useRef, useState } from "react";
import { Form, Link, useActionData, useNavigate, useNavigation } from "react-router";
import { MaxFileSizeExceededError, parseFormData } from "@mjackson/form-data-parser";
import type { Route } from "./+types/apply";
import { Icon } from "../components/icons";
import { MAX_PHOTOS, MAX_PHOTO_MB, PhotoUpload, formatBytes } from "../components/photo-upload";
import { escapeHtml, sendMail, toAttachment, type Attachment } from "../lib/mailer.server";
import { useReveal } from "../lib/use-reveal";
import { ASSETS, SITE } from "../lib/site";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Apply now — STLTH Pawn" },
    {
      name: "description",
      content:
        "Apply for a fast, hassle-free short-term loan against your car, motorbike, caravan or trailer. No credit checks, no application fee.",
    },
  ];
}

type TextField = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  placeholder?: string;
  /** render at half width on wider screens */
  half?: boolean;
  optional?: boolean;
};

const CONTACT_FIELDS: TextField[] = [
  { name: "first_name", label: "First name", autoComplete: "given-name", half: true },
  { name: "last_name", label: "Last name", autoComplete: "family-name", half: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email", half: true },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", inputMode: "tel", half: true },
  { name: "address", label: "Address, suburb & postcode", autoComplete: "street-address" },
];

/** Registered vehicles — hidden when the asset is "Something else". */
const VEHICLE_FIELDS: TextField[] = [
  { name: "asset_make_model", label: "Asset make & model", placeholder: "e.g. Toyota Hilux SR5", optional: true },
  { name: "asset_year", label: "Year", inputMode: "numeric", placeholder: "2018", half: true, optional: true },
  { name: "rego", label: "Rego number", placeholder: "ABC123", half: true, optional: true },
];

const OTHER_FIELDS: TextField[] = [
  { name: "asset_description", label: "What is it?", placeholder: "e.g. ride-on mower, excavator attachment", optional: true },
];

const TEXT_FIELDS: TextField[] = [...CONTACT_FIELDS, ...VEHICLE_FIELDS, ...OTHER_FIELDS];

function validateField(name: string, value: string, optional = false) {
  const trimmed = value.trim();
  if (!trimmed) return optional ? null : "This field is required.";
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return "Please enter a valid email address.";
  if (name === "phone" && trimmed.replace(/\D/g, "").length < 8) return "Please enter a valid phone number.";
  if (name === "asset_year" && !/^(19|20)\d{2}$/.test(trimmed)) return "Please enter a 4-digit year.";
  return null;
}

// ── Server action ────────────────────────────────────────────
export async function action({ request }: Route.ActionArgs) {
  const ONE_MB = 1024 * 1024;
  const photos: { buffer: Buffer; filename: string; contentType: string }[] = [];

  let formData: FormData;
  try {
    // parseFormData's signature is (request, options, uploadHandler) — passing the
    // handler second makes it the handler and silently discards the options.
    formData = await parseFormData(
      request,
      { maxFileSize: MAX_PHOTO_MB * ONE_MB, maxFiles: MAX_PHOTOS },
      async (fileUpload) => {
        if (fileUpload.fieldName !== "photos" || !fileUpload.name) return undefined;
        const bytes = new Uint8Array(await fileUpload.arrayBuffer());
        if (bytes.byteLength === 0) return undefined;
        photos.push({
          buffer: Buffer.from(bytes),
          filename: fileUpload.name,
          contentType: fileUpload.type || "application/octet-stream",
        });
        return undefined;
      },
    );
  } catch (error) {
    if (error instanceof MaxFileSizeExceededError) {
      return {
        ok: false as const,
        error: `One of your photos is over the ${MAX_PHOTO_MB} MB limit. Please resize it and try again.`,
      };
    }
    return { ok: false as const, error: "We couldn't read your application. Please try again." };
  }

  const value = (key: string) => String(formData.get(key) ?? "").trim();
  const firstName = value("first_name");
  const email = value("email");

  // The asset fields are optional, and the vehicle ones are not even rendered for
  // "Something else" — so only mail the rows that actually carry something.
  const rows: [string, string][] = (
    [
      ["Name", `${firstName} ${value("last_name")}`.trim()],
      ["Email", email],
      ["Phone", value("phone")],
      ["Address", value("address")],
      ["Asset type", value("asset_type")],
      ["What it is", value("asset_description")],
      ["Make & model", value("asset_make_model")],
      ["Year", value("asset_year")],
      ["Rego", value("rego")],
      ["Amount wanted", value("amount")],
      ["Notes", value("notes")],
    ] as [string, string][]
  ).filter(([, val]) => val !== "");

  if (!firstName || !email) {
    return { ok: false as const, error: "Please fill in your name and email, then try again." };
  }

  const attachments: Attachment[] = photos.map((photo) =>
    toAttachment(photo.buffer, photo.filename, photo.contentType),
  );

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;color:#16212a">
      <div style="background:#2BB3AC;padding:28px;text-align:center;border-radius:12px 12px 0 0">
        <p style="margin:0 0 6px;color:#effbf9;letter-spacing:.18em;font-size:11px;text-transform:uppercase">STLTH Pawn</p>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800">New loan application</h1>
      </div>
      <div style="border:1px solid #e6eaed;border-top:none;padding:28px;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows
            .map(
              ([label, val]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f2f4;color:#5b6b78;width:170px;vertical-align:top">${escapeHtml(label)}</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f2f4;font-weight:600">${escapeHtml(val)}</td>
            </tr>`,
            )
            .join("")}
        </table>
        <p style="margin:22px 0 0;font-size:13px;color:#5b6b78">
          ${attachments.length} photo(s) attached${
            attachments.length ? `: ${attachments.map((a) => escapeHtml(a.filename)).join(", ")}` : ""
          }
        </p>
        <p style="margin:18px 0 0;padding:12px 14px;background:#effbf9;border-radius:8px;font-size:13px;color:#124f4d">
          Declarations accepted: asset held for the loan term, and owned outright with no monies owing.
        </p>
      </div>
    </div>`;

  const sent = await sendMail({
    subject: `New STLTH Pawn application — ${firstName} ${value("last_name")}`.trim(),
    html,
    replyTo: email,
    attachments,
  });

  if (!sent.ok) {
    return {
      ok: false as const,
      error: `We couldn't send your application. Please try again, or call us on ${SITE.phone}.`,
    };
  }

  return {
    ok: true as const,
    summary: {
      name: `${firstName} ${value("last_name")}`.trim(),
      email,
      photos: photos.map((photo) => ({ filename: photo.filename, size: photo.buffer.length })),
    },
  };
}

// ── Confirmation ─────────────────────────────────────────────
const NEXT_STEPS = [
  { title: "Application received", body: "Your details and photos are with us now — nothing else is needed today.", done: true },
  { title: "We value your asset", body: "Usually within a few hours during business hours. We may call if we need another photo.", done: false },
  { title: "Your offer, then your cash", body: "Accept the offer, we arrange pickup or drop-off, and the money is yours.", done: false },
];

function Confirmation({
  summary,
  onReset,
}: {
  summary?: { name: string; email: string; photos: { filename: string; size: number }[] };
  onReset: () => void;
}) {
  const firstName = summary?.name?.split(/\s+/)[0] ?? "";

  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-b from-teal-50 to-white px-7 py-12 text-center sm:px-10">
        <span className="pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/30">
          <Icon.check className="h-8 w-8" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink-900">
          {firstName ? `Thanks, ${firstName}.` : "Application received."}
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-500">
          Your application is in. We'll review your asset and come back to you with an offer —
          usually the same day.
        </p>
      </div>

      <div className="border-t border-ink-500/10 px-7 py-7 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">What you sent</p>
        <dl className="mt-4 space-y-0">
          <div className="flex items-center justify-between gap-4 border-b border-ink-500/10 py-2.5 text-sm">
            <dt className="text-ink-500">Name</dt>
            <dd className="font-medium text-ink-900">{summary?.name || "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-ink-500/10 py-2.5 text-sm">
            <dt className="text-ink-500">Email</dt>
            <dd className="font-medium break-all text-ink-900">{summary?.email || "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <dt className="text-ink-500">Photos</dt>
            <dd className="font-medium text-ink-900">
              {summary?.photos.length ?? 0} attached
              {summary?.photos.length
                ? ` · ${formatBytes(summary.photos.reduce((sum, p) => sum + p.size, 0))}`
                : ""}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-ink-500/10 px-7 py-7 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">What happens next</p>
        <ol className="mt-5 space-y-5">
          {NEXT_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex flex-col items-center">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    step.done ? "bg-teal-500 ring-4 ring-teal-500/15" : "border border-ink-500/30"
                  }`}
                />
                {index < NEXT_STEPS.length - 1 && <span className="my-1.5 w-px flex-1 bg-ink-500/15" />}
              </span>
              <div className={index < NEXT_STEPS.length - 1 ? "pb-1" : ""}>
                <p className="text-sm font-semibold text-ink-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-500/10 bg-ink-500/[0.03] px-7 py-5 sm:px-10">
        <span className="text-sm text-ink-500">Need it sooner? Give us a call.</span>
        <div className="flex flex-wrap gap-2">
          <a href={SITE.phoneHref} className="btn btn-ghost btn-sm px-5 text-sm">
            <Icon.phone className="h-4 w-4 text-teal-500" /> {SITE.phone}
          </a>
          <button type="button" onClick={onReset} className="btn btn-primary px-5 text-sm">
            New application <Icon.arrow className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function Apply() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  const submitted = actionData?.ok === true;
  const summary = actionData?.ok === true ? actionData.summary : undefined;
  const serverError = actionData?.ok === false ? actionData.error : null;

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(TEXT_FIELDS.map((field) => [field.name, ""])),
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [assetType, setAssetType] = useState<string>(ASSETS[0].slug);
  const [photoCount, setPhotoCount] = useState(0);
  const [declarations, setDeclarations] = useState({ held: false, owned: false });
  const [showMissing, setShowMissing] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);
  useReveal(submitted);

  useEffect(() => {
    if (submitted || serverError) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [submitted, serverError]);

  const isOther = assetType === "other";
  const assetFields = isOther ? OTHER_FIELDS : VEHICLE_FIELDS;
  const shownFields = [...CONTACT_FIELDS, ...assetFields];

  const fieldError = (field: TextField) =>
    validateField(field.name, values[field.name] ?? "", field.optional);

  const textValid = shownFields.every((field) => !fieldError(field));
  const ready = textValid && photoCount > 0 && declarations.held && declarations.owned;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (ready) return;
    event.preventDefault();
    setShowMissing(true);
    setTouched(Object.fromEntries(shownFields.map((field) => [field.name, true])));
    const firstInvalid = shownFields.find((field) => fieldError(field));
    const selector = firstInvalid ? `[name="${firstInvalid.name}"]` : photoCount === 0 ? "#photos-section" : "#declarations";
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (firstInvalid) (document.querySelector(selector) as HTMLInputElement | null)?.focus({ preventScroll: true });
  }

  function resetForm() {
    navigate("/apply", { replace: true });
    setValues(Object.fromEntries(TEXT_FIELDS.map((field) => [field.name, ""])));
    setTouched({});
    setPhotoCount(0);
    setDeclarations({ held: false, owned: false });
    setShowMissing(false);
  }

  return (
    <>
      <section className="border-b border-ink-500/10 bg-gradient-to-b from-teal-50 to-white">
        <div className="shell py-14 sm:py-16" ref={topRef}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Apply now</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            Are you needing cash now?
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">
            Apply for a fast, hassle-free loan. Taking your asset as security means we can lend quickly
            with no credit check — and no risk of debt recovery action if you can't pay out on time.
          </p>
        </div>
      </section>

      <section className="shell grid gap-10 py-14 lg:grid-cols-[1fr_320px]">
        <div>
          {submitted ? (
            <Confirmation summary={summary} onReset={resetForm} />
          ) : (
            <Form method="post" encType="multipart/form-data" onSubmit={onSubmit} className="card p-6 sm:p-9">
              <h2 className="font-display text-2xl font-extrabold text-ink-900">Your application</h2>
              <p className="mt-1.5 text-sm text-ink-500">Takes about two minutes. Everything marked is required.</p>

              {/* contact */}
              <fieldset className="mt-8">
                <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                  About you
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {CONTACT_FIELDS.map(
                    (field) => {
                      const error = touched[field.name] ? fieldError(field) : null;
                      return (
                        <div key={field.name} className={field.half ? "" : "sm:col-span-2"}>
                          <label className="field-label" htmlFor={field.name}>{field.label}</label>
                          <input
                            id={field.name}
                            name={field.name}
                            type={field.type ?? "text"}
                            autoComplete={field.autoComplete}
                            placeholder={field.placeholder}
                            className={`field-input ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : ""}`}
                            value={values[field.name] ?? ""}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? `${field.name}-error` : undefined}
                            onChange={(event) =>
                              setValues((prev) => ({ ...prev, [field.name]: event.target.value }))
                            }
                            onBlur={() => setTouched((prev) => ({ ...prev, [field.name]: true }))}
                          />
                          {error && <span className="field-error" id={`${field.name}-error`} role="alert">{error}</span>}
                        </div>
                      );
                    },
                  )}
                </div>
              </fieldset>

              {/* asset */}
              <fieldset className="mt-9">
                <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Your asset
                </legend>

                <span className="field-label">What are you borrowing against?</span>
                <div className="mb-5 flex flex-wrap gap-2">
                  {ASSETS.map((asset) => (
                    <label
                      key={asset.slug}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        assetType === asset.slug
                          ? "border-teal-500 bg-teal-500 text-white shadow-sm shadow-teal-500/25"
                          : "border-ink-500/20 text-ink-700 hover:border-teal-500/50 hover:text-teal-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="asset_type"
                        value={asset.label}
                        checked={assetType === asset.slug}
                        onChange={() => setAssetType(asset.slug)}
                        className="sr-only"
                      />
                      {asset.label}
                    </label>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {assetFields.map((field) => {
                    const error = touched[field.name] ? fieldError(field) : null;
                    return (
                      <div key={field.name} className={field.half ? "" : "sm:col-span-2"}>
                        <label className="field-label" htmlFor={field.name}>
                          {field.label}
                          {field.optional && (
                            <span className="font-normal normal-case tracking-normal text-ink-500/70"> (optional)</span>
                          )}
                        </label>
                        <input
                          id={field.name}
                          name={field.name}
                          type="text"
                          inputMode={field.inputMode}
                          placeholder={field.placeholder}
                          className={`field-input ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : ""}`}
                          value={values[field.name] ?? ""}
                          aria-invalid={error ? true : undefined}
                          onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                          onBlur={() => setTouched((prev) => ({ ...prev, [field.name]: true }))}
                        />
                        {error && <span className="field-error" role="alert">{error}</span>}
                      </div>
                    );
                  })}

                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="amount">
                      How much are you after? <span className="font-normal normal-case tracking-normal text-ink-500/70">(optional)</span>
                    </label>
                    <input id="amount" name="amount" type="text" inputMode="numeric" placeholder="$2,000" className="field-input" />
                  </div>
                </div>
              </fieldset>

              {/* photos */}
              <fieldset className="mt-9" id="photos-section">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Photos of your asset
                </legend>
                <p className="mb-4 text-sm leading-relaxed text-ink-500">
                  Clear photos get you an accurate valuation faster. Add at least one — most people send four or five.
                </p>
                <PhotoUpload name="photos" onChange={setPhotoCount} invalid={showMissing && photoCount === 0} />
                {showMissing && photoCount === 0 && (
                  <span className="field-error" role="alert">Please add at least one photo of your asset.</span>
                )}
              </fieldset>

              {/* notes */}
              <div className="mt-9">
                <label className="field-label" htmlFor="notes">
                  Anything else we should know? <span className="font-normal normal-case tracking-normal text-ink-500/70">(optional)</span>
                </label>
                <textarea id="notes" name="notes" rows={3} className="field-input resize-y" placeholder="Condition, modifications, or when you need the cash by." />
              </div>

              {/* declarations */}
              <fieldset className="mt-9" id="declarations">
                <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Declarations
                </legend>
                <div className="space-y-3">
                  {[
                    { key: "held" as const, label: "I understand my asset will be held for the duration of the loan." },
                    { key: "owned" as const, label: "I own the asset outright and there are no monies owing on it." },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        declarations[item.key]
                          ? "border-teal-500/50 bg-teal-50/60"
                          : showMissing
                            ? "border-red-300 bg-red-50/30"
                            : "border-ink-500/15 hover:border-teal-500/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name={item.key === "held" ? "declare_held" : "declare_owned"}
                        checked={declarations[item.key]}
                        onChange={(event) =>
                          setDeclarations((prev) => ({ ...prev, [item.key]: event.target.checked }))
                        }
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-ink-500/30 text-teal-500 accent-teal-500"
                      />
                      <span className="text-sm leading-relaxed text-ink-700">{item.label}</span>
                    </label>
                  ))}
                </div>
                {showMissing && (!declarations.held || !declarations.owned) && (
                  <span className="field-error" role="alert">Please accept both declarations to continue.</span>
                )}
              </fieldset>

              {serverError && (
                <p className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {serverError}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-8 w-full py-4 text-base">
                {isSubmitting ? (
                  <><Icon.spinner className="h-4 w-4" /> Sending your application…</>
                ) : (
                  <>Submit my application <Icon.arrow className="h-4 w-4" /></>
                )}
              </button>
              <p className="mt-3 text-center text-xs leading-relaxed text-ink-500">
                Your details go straight to STLTH Pawn and are never shared with anyone else.
              </p>
            </Form>
          )}
        </div>

        {/* aside */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-base font-bold text-ink-900">Why STLTH Pawn</h2>
            <ul className="mt-4 space-y-3">
              {["No credit checks", "No application fee", "Same-day approvals", `Up to ${SITE.maxLoanPercent}% of asset value`, "Pickup and redelivery"].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-ink-700">
                  <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card bg-ink-900 p-6 text-white">
            <h2 className="font-display text-base font-bold">Rather talk it through?</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Call us and we'll give you a ballpark over the phone.
            </p>
            <a href={SITE.phoneHref} className="btn btn-sand mt-5 w-full py-3">
              <Icon.phone className="h-4 w-4" /> {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="mt-3 flex items-center justify-center gap-2 text-sm text-white/65 transition-colors hover:text-teal-400">
              <Icon.mail className="h-4 w-4" /> {SITE.email}
            </a>
          </div>

          <Link to="/services" className="block rounded-card border border-ink-500/15 p-6 transition-colors hover:border-teal-500/40">
            <p className="font-display text-base font-bold text-ink-900">Not sure what we take?</p>
            <p className="mt-1.5 text-sm text-ink-500">See everything we lend against and our fees.</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600">
              View services <Icon.arrow className="h-4 w-4" />
            </span>
          </Link>
        </aside>
      </section>
    </>
  );
}
