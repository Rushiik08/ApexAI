import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error("RESEND_API_KEY is not configured in environment variables.");
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey.trim());
  }
  return resendClient;
}

export function getValidatedAppUrl(): string {
  const rawUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const url = new URL(rawUrl.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    return url.origin;
  } catch {
    throw new Error("APP_URL must be a valid HTTP or HTTPS URL.");
  }
}

export function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM;
  if (from && from.trim()) {
    return from.trim();
  }
  return "ApexAI <onboarding@resend.dev>";
}

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetEmailParams): Promise<{ id: string }> {
  const resend = getResendClient();
  const from = getEmailFrom();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Reset your ApexAI password",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 36px 32px;">
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Apex<span style="color: #818cf8;">AI</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Password Reset Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px; font-size: 14px; line-height: 22px; color: #94a3b8;">
              We received a request to reset the password for your ApexAI account. Click the button below to choose a new password. This link is valid for 1 hour.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px; font-size: 12px; line-height: 18px; color: #64748b;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="color: #818cf8; word-break: break-all; text-decoration: underline;">
                ${resetUrl}
              </a>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; line-height: 18px; color: #64748b;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    text: `Reset your ApexAI password\n\nWe received a request to reset the password for your account. Visit the following link to choose a new password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this reset, you can safely ignore this email.`,
  });

  if (error) {
    throw new Error(`Resend delivery failed: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Resend did not return a message ID.");
  }

  return { id: data.id };
}
