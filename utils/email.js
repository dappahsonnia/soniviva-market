/* =========================================
   SONIVIVA — Email Service
   Handles sending OTP codes for password reset
   ========================================= */
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = 'dappahsonnia@gmail.com';
const SMTP_USER = process.env.SMTP_USER || ADMIN_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_PASS) {
    console.warn('⚠️  SMTP_PASS / GMAIL_APP_PASSWORD not set. Email delivery will be logged to server console.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  return transporter;
}

/**
 * Send 6-digit password reset verification code (OTP) to user's email
 */
async function sendPasswordResetOtp(toEmail, code) {
  console.log(`🔑 [PASSWORD RESET OTP] Verification code for ${toEmail}: ${code}`);

  const transport = getTransporter();
  if (!transport) {
    console.log(`📧 Email skipped (no GMAIL_APP_PASSWORD configured). OTP code is: ${code}`);
    return { sent: false, simulated: true, code };
  }

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0; padding:0; background:#FAF9F6; font-family:'Segoe UI', Arial, sans-serif; color:#2D2D2D;">
    <div style="max-width:540px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 6px 25px rgba(0,0,0,0.06); border:1px solid #E5E2DB;">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #1B5E20, #2E7D32); padding:32px 28px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing:2px; font-weight:800;">SONI<span style="color:#D4A017;">VIVA</span></h1>
        <p style="color:#E8F5E9; margin:6px 0 0; font-size:13px;">Password Reset Verification Code</p>
      </div>

      <!-- Content -->
      <div style="padding:32px 28px;">
        <h2 style="font-size:18px; color:#1B5E20; margin:0 0 12px;">Hello,</h2>
        <p style="font-size:14px; line-height:1.6; color:#555; margin:0 0 20px;">
          We received a request to reset the password for your <strong>SONIVIVA</strong> account associated with <strong>${toEmail}</strong>.
        </p>
        <p style="font-size:14px; line-height:1.6; color:#555; margin:0 0 16px;">
          Enter the following 6-digit verification code to complete your password reset:
        </p>

        <!-- OTP Display Box -->
        <div style="background:#F0EDE6; border:2px dashed #D4A017; border-radius:12px; padding:20px; text-align:center; margin:24px 0;">
          <span style="font-size:32px; font-weight:800; letter-spacing:8px; color:#1B5E20; font-family:Consolas, Monaco, monospace; display:inline-block;">
            ${code}
          </span>
          <p style="margin:10px 0 0; font-size:12px; color:#888;">
            ⏱️ This code expires in <strong>15 minutes</strong>.
          </p>
        </div>

        <p style="font-size:13px; line-height:1.6; color:#777; margin:20px 0 0;">
          If you did not request a password reset, you can safely ignore this email. Your account remains secure.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#F8FBF8; padding:20px 28px; text-align:center; border-top:1px solid #E5E2DB;">
        <p style="margin:0; font-size:12px; color:#999;">
          © 2026 SONIVIVA by Rita Foods and Co. All rights reserved.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    await transport.sendMail({
      from: `"SONIVIVA Security" <${SMTP_USER}>`,
      to: toEmail,
      subject: `🔑 Your Password Reset Code: ${code} — SONIVIVA`,
      html: htmlBody
    });
    console.log(`📧 OTP email successfully sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error('📧 OTP email send error:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendPasswordResetOtp };
