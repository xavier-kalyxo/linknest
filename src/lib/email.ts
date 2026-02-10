const EMAILIT_API_KEY = process.env.EMAILIT_API_KEY!;
const FROM = process.env.EMAIL_FROM || "LinkNest <noreply@linknest.io>";
const APP_URL = process.env.AUTH_URL || "http://localhost:3000";

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.emailit.com/v2/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${EMAILIT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Emailit API error (${res.status}): ${body}`);
  }
}

export async function sendMagicLinkEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  await sendEmail({
    to,
    subject: "Sign in to LinkNest",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin-bottom: 24px;">Sign in to LinkNest</h2>
        <p style="color: #555; line-height: 1.6;">
          Click the button below to sign in to your LinkNest account.
          This link expires in 24 hours.
        </p>
        <a href="${url}"
           style="display: inline-block; margin: 24px 0; padding: 12px 32px;
                  background: #000; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 600;">
          Sign in to LinkNest
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail({
  to,
  token,
}: {
  to: string;
  token: string;
}) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  await sendEmail({
    to,
    subject: "Verify your LinkNest account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin-bottom: 24px;">Verify your email</h2>
        <p style="color: #555; line-height: 1.6;">
          Thanks for creating a LinkNest account. Click the button below
          to verify your email address. This link expires in 1 hour.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 32px;
                  background: #000; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 600;">
          Verify email address
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          If you didn't create a LinkNest account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
