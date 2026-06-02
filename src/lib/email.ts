/**
 * PIYROX Market — Email Utilities
 *
 * Uses nodemailer with SMTP env vars.
 * All emails use the PIYROX brand.
 */

import nodemailer from "nodemailer";

// ─── Transporter ────────────────────────────────────────────

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

const FROM_ADDRESS = process.env.SMTP_FROM || "PIYROX Market <noreply@piyrox.sbs>";

// ─── Base HTML wrapper ──────────────────────────────────────

function wrapHtml(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 32px; }
    .logo { color: #a855f7; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 24px; }
    h1 { color: #fff; font-size: 20px; margin: 0 0 16px; }
    p { color: #999; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #a855f7; color: #fff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .code-box { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .code-box code { color: #a855f7; font-size: 16px; font-family: 'Courier New', monospace; }
    .footer { text-align: center; padding-top: 24px; }
    .footer p { color: #555; font-size: 12px; }
    .divider { border: none; border-top: 1px solid #222; margin: 24px 0; }
    .credential { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 12px 16px; margin: 8px 0; font-family: 'Courier New', monospace; color: #58a6ff; font-size: 13px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">⚡ PIYROX</div>
      ${body}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} PIYROX Market · piyrox.sbs</p>
      <p>You're receiving this because you have an account at piyrox.sbs</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── Send helper ────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("[Email Error]", error);
    return false;
  }
}

// ─── Email Functions ────────────────────────────────────────

/**
 * Send email verification link.
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<boolean> {
  const html = wrapHtml(
    "Verify Your Email — PIYROX",
    `
    <h1>Welcome to PIYROX, ${name || "there"}! 🎉</h1>
    <p>Thanks for creating an account. Please verify your email address to get started.</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    </p>
    <p>Or copy and paste this URL into your browser:</p>
    <div class="code-box"><code>${verificationUrl}</code></div>
    <hr class="divider" />
    <p>This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `
  );
  return sendEmail(email, "Verify your email — PIYROX Market", html);
}

/**
 * Send order confirmation.
 */
export async function sendOrderConfirmation(
  email: string,
  orderDetails: {
    orderId: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    currency?: string;
  }
): Promise<boolean> {
  const currency = orderDetails.currency || "USD";
  const html = wrapHtml(
    "Order Confirmed — PIYROX",
    `
    <h1>Order Confirmed! ✅</h1>
    <p>Your order has been received and is being processed.</p>
    <div class="code-box">
      <p style="color: #fff; margin: 0 0 8px;"><strong>Order ID:</strong> <code>${orderDetails.orderId}</code></p>
      <p style="color: #fff; margin: 0 0 8px;"><strong>Product:</strong> ${orderDetails.productName}</p>
      <p style="color: #fff; margin: 0 0 8px;"><strong>Quantity:</strong> ${orderDetails.quantity}</p>
      <p style="color: #fff; margin: 0;"><strong>Total:</strong> ${currency} ${orderDetails.totalPrice.toFixed(2)}</p>
    </div>
    <p>We'll send your digital product details shortly. You can also check your order status at:</p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="https://piyrox.sbs/orders/${orderDetails.orderId}" class="btn">View Order</a>
    </p>
    `
  );
  return sendEmail(email, `Order Confirmed #${orderDetails.orderId.slice(-8).toUpperCase()} — PIYROX`, html);
}

/**
 * Send delivery email with credentials.
 */
export async function sendDeliveryEmail(
  email: string,
  deliveryDetails: {
    orderId: string;
    productName: string;
    credentials: string[];
  }
): Promise<boolean> {
  const credentialsHtml = deliveryDetails.credentials
    .map((cred) => `<div class="credential">${cred}</div>`)
    .join("");

  const html = wrapHtml(
    "Your Order is Ready — PIYROX",
    `
    <h1>Your order has been delivered! 🚀</h1>
    <p>Here are your credentials for <strong>${deliveryDetails.productName}</strong>:</p>
    ${credentialsHtml}
    <hr class="divider" />
    <p><strong>⚠️ Important:</strong> Save these credentials securely. Do not share them with anyone.</p>
    <p>If you have any issues with your product, contact us at <a href="mailto:support@piyrox.sbs" style="color: #a855f7;">support@piyrox.sbs</a></p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="https://piyrox.sbs/orders/${deliveryDetails.orderId}" class="btn">View Order</a>
    </p>
    `
  );
  return sendEmail(email, `Your Order is Ready — PIYROX`, html);
}

/**
 * Send account lockout notification.
 */
export async function sendLockoutEmail(
  email: string,
  name: string
): Promise<boolean> {
  const html = wrapHtml(
    "Account Locked — PIYROX",
    `
    <h1>Account Security Alert 🔒</h1>
    <p>Hi ${name || "there"},</p>
    <p>Your PIYROX account has been temporarily locked due to multiple failed login attempts.</p>
    <p>The lockout will automatically expire in <strong>15 minutes</strong>.</p>
    <hr class="divider" />
    <p>If this wasn't you, we recommend changing your password immediately after the lockout expires.</p>
    <p>If you need help, contact us at <a href="mailto:support@piyrox.sbs" style="color: #a855f7;">support@piyrox.sbs</a></p>
    `
  );
  return sendEmail(email, "Account Locked — PIYROX Market", html);
}

/**
 * Send password reset link.
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  const html = wrapHtml(
    "Reset Password — PIYROX",
    `
    <h1>Reset Your Password</h1>
    <p>Hi ${name || "there"},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <p>Or copy and paste this URL into your browser:</p>
    <div class="code-box"><code>${resetUrl}</code></div>
    <hr class="divider" />
    <p>This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
    `
  );
  return sendEmail(email, "Reset Your Password — PIYROX Market", html);
}
