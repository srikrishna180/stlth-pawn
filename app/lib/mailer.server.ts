import { Resend } from "resend";

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type Attachment = {
  filename: string;
  /** Resend JSON-stringifies the body and passes `content` through untouched, so a
   *  raw Buffer serialises to {"type":"Buffer","data":[...]} and the API drops the
   *  attachment. It has to be base64. */
  content: string;
  contentType: string;
};

export function toAttachment(buffer: Buffer, filename: string, contentType: string): Attachment {
  return { filename, content: buffer.toString("base64"), contentType };
}

export async function sendMail(options: {
  subject: string;
  html: string;
  replyTo?: string;
  attachments: Attachment[];
}) {
  const from = process.env.EMAIL_FROM;
  const to = process.env.EMAIL_TO;
  const apiKey = process.env.RESEND_API_KEY;

  if (!from || !to || !apiKey) {
    console.error("Mail is not configured: set RESEND_API_KEY, EMAIL_FROM and EMAIL_TO.");
    return { ok: false as const };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    attachments: options.attachments,
  });

  if (error) {
    console.error("Resend error:", error);
    return { ok: false as const };
  }

  console.log("Resend accepted:", data?.id);
  return { ok: true as const };
}
