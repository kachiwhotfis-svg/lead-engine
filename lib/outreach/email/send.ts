import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Missing SMTP_HOST, SMTP_PORT, SMTP_USER, or SMTP_PASS.");
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendColdEmail(params: {
  to: string;
  subject: string;
  body: string;
}) {
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME;
  if (!fromEmail) throw new Error("Missing FROM_EMAIL.");

  await getTransporter().sendMail({
    from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
    to: params.to,
    subject: params.subject,
    text: params.body,
  });
}
