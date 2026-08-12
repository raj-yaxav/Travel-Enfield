import nodemailer from 'nodemailer';

let cachedTransporter;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cachedTransporter;
}

function otpEmailHtml(name, code) {
  const digits = code.split('').map(d => `<td style="width:44px;height:56px;background:#F8F5FA;border:1px solid rgba(85,22,123,.15);border-radius:12px;font-family:Arial,sans-serif;font-size:26px;font-weight:800;color:#450D69;text-align:center;vertical-align:middle;">${d}</td>`).join('<td style="width:8px;"></td>');
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#F1ECF6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1ECF6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(69,13,105,.12);">
        <tr><td style="background:linear-gradient(135deg,#55167B,#450D69);padding:28px 32px;">
          <span style="font-family:Arial,sans-serif;font-size:20px;font-weight:800;color:#FBCF08;letter-spacing:.02em;">TravelEnfield</span>
        </td></tr>
        <tr><td style="padding:36px 32px 8px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;color:#6b7280;">Hi ${name ? name.split(' ')[0] : 'there'},</p>
          <h1 style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#23182B;">Your login code</h1>
          <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#6b7280;">Enter this code to finish signing in to your TravelEnfield account. It expires in 10 minutes.</p>
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>${digits}</tr></table>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:19px;color:#9ca3af;">Didn't request this? You can safely ignore this email — no account changes were made.</p>
        </td></tr>
        <tr><td style="background:#F8F5FA;padding:18px 32px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} TravelEnfield India Pvt Ltd</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(to, name, code) {
  const transporter = getTransporter();
  if (!transporter) throw new Error('Email is not configured on this server. Set SMTP_HOST, SMTP_USER and SMTP_PASS in your environment.');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'TravelEnfield <no-reply@travelenfield.in>',
    to,
    subject: `${code} is your TravelEnfield login code`,
    text: `Your TravelEnfield login code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: otpEmailHtml(name, code),
  });
}
