const nodemailer = require("nodemailer");

/**
 * Creates and configures the nodemailer transporter.
 * Supports Gmail, custom SMTP, or any service supported by nodemailer.
 */
const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    if (process.env.EMAIL_SERVICE) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user,
                pass
            }
        });
    }

    if (process.env.EMAIL_HOST) {
        const port = Number(process.env.EMAIL_PORT) || 587;
        const secure = process.env.EMAIL_SECURE === "true" || port === 465;

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port,
            secure,
            auth: {
                user,
                pass
            }
        });
    }

    // Default to Gmail if user is provided and looks like a Gmail address or general SMTP
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass
        }
    });
};

/**
 * Returns user-friendly badge styling details based on notification type.
 */
const getTypeConfig = (type) => {
    switch (type) {
        case "career":
            return {
                label: "Career Alert",
                badgeClass: "badge-career",
                color: "#6d28d9",
                bg: "#ede9fe"
            };
        case "roadmap":
            return {
                label: "Roadmap Progress",
                badgeClass: "badge-roadmap",
                color: "#047857",
                bg: "#d1fae5"
            };
        case "update":
            return {
                label: "Important Update",
                badgeClass: "badge-update",
                color: "#b45309",
                bg: "#fef3c7"
            };
        case "general":
        default:
            return {
                label: "Notification",
                badgeClass: "badge-general",
                color: "#0369a1",
                bg: "#e0f2fe"
            };
    }
};

/**
 * Send a notification email to a user.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} [options.name] - Recipient name
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message content
 * @param {string} [options.type] - Notification type (career, roadmap, update, general)
 * @param {string} [options.actionUrl] - Direct link (defaults to dashboard or roadmap)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string, notConfigured?: boolean}>}
 */
const sendNotificationEmail = async ({ to, name, title, message, type = "general", actionUrl }) => {
    try {
        if (!to) {
            console.warn("[Email Service] Missing recipient email. Skipping email.");
            return { success: false, error: "Recipient email is required" };
        }

        const transporter = createTransporter();

        const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const targetUrl = actionUrl || (type === "roadmap" ? `${clientBaseUrl}/roadmap` : `${clientBaseUrl}/dashboard`);
        const recipientName = name ? name.trim() : "Student";
        const typeConfig = getTypeConfig(type);

        // If credentials are not set in .env, log cleanly without throwing
        if (!transporter) {
            console.log(
                `[Email Service] (SMTP not configured) Notification for <${to}>: "${title}" - "${message}"`
            );
            return {
                success: false,
                notConfigured: true,
                message: "SMTP credentials not configured in environment (EMAIL_USER / EMAIL_PASS missing)"
            };
        }

        const fromAddress =
            process.env.EMAIL_FROM ||
            `"Career Horizon" <${process.env.EMAIL_USER}>`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
    .wrapper { width: 100%; max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: #e0e7ff; font-size: 14px; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; background-color: ${typeConfig.bg}; color: ${typeConfig.color}; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
    .greeting { font-size: 15px; color: #475569; margin: 0 0 16px; }
    .message-box { background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 6px; padding: 18px 20px; margin: 16px 0 26px; font-size: 15px; line-height: 1.6; color: #334155; }
    .btn-container { text-align: center; margin: 28px 0 16px; }
    .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3); }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #4f46e5; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Career Horizon</h1>
      <p>Personalized Career Guidance & Roadmap Platform</p>
    </div>
    <div class="content">
      <div class="badge">${typeConfig.label}</div>
      <h2 class="title">${title}</h2>
      <p class="greeting">Hi ${recipientName},</p>
      <div class="message-box">
        ${message}
      </div>
      <div class="btn-container">
        <a href="${targetUrl}" class="btn" target="_blank">View in Career Horizon</a>
      </div>
    </div>
    <div class="footer">
      <p>You received this email because you are a registered member of Career Horizon.</p>
      <p>&copy; ${new Date().getFullYear()} Career Horizon. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `;

        const text = `Career Horizon Notification: ${title}\n\nHi ${recipientName},\n\n${message}\n\nView details: ${targetUrl}\n\n---\nCareer Horizon - Personalized Career Guidance Platform`;

        const mailOptions = {
            from: fromAddress,
            to,
            subject: `[Career Horizon] ${title}`,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Notification email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error(`[Email Service] Error sending email to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send a password reset OTP code email.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} [options.name] - Recipient name
 * @param {string} options.otp - 6-digit verification code
 * @param {number} [options.expiresMinutes] - Expiration duration in minutes (default 15)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string, notConfigured?: boolean}>}
 */
const sendPasswordResetEmail = async ({ to, name, otp, expiresMinutes = 15 }) => {
    try {
        if (!to) {
            return { success: false, error: "Recipient email is required" };
        }

        const transporter = createTransporter();
        const recipientName = name ? name.trim() : "Student";

        // If credentials are not configured, log prominently so development/testing works
        if (!transporter) {
            console.log(
                `\n=========================================\n[Email Service] (SMTP not configured)\nPassword Reset OTP for <${to}>: [ ${otp} ] (Valid for ${expiresMinutes} mins)\n=========================================\n`
            );
            return {
                success: true,
                notConfigured: true,
                message: "SMTP not configured in .env; OTP logged to server console for testing"
            };
        }

        const fromAddress =
            process.env.EMAIL_FROM ||
            `"Career Horizon" <${process.env.EMAIL_USER}>`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
    .wrapper { width: 100%; max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .header p { margin: 6px 0 0; color: #e0e7ff; font-size: 14px; }
    .content { padding: 32px 28px; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
    .greeting { font-size: 15px; color: #475569; margin: 0 0 16px; }
    .otp-card { background: #f8fafc; border: 2px dashed #6366f1; border-radius: 10px; padding: 22px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 0; }
    .otp-caption { font-size: 13px; color: #64748b; margin-top: 8px; }
    .warning { font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 20px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Career Horizon</h1>
      <p>Password Reset Request</p>
    </div>
    <div class="content">
      <h2 class="title">Reset Your Password</h2>
      <p class="greeting">Hi ${recipientName},</p>
      <p>We received a request to reset the password for your Career Horizon account. Use the verification code below to set a new password:</p>
      
      <div class="otp-card">
        <div class="otp-code">${otp}</div>
        <div class="otp-caption">This code will expire in ${expiresMinutes} minutes.</div>
      </div>

      <p class="warning">
        If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized activity on your account.
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Career Horizon. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `;

        const text = `Career Horizon Password Reset\n\nHi ${recipientName},\n\nYour 6-digit password reset code is: ${otp}\n\nThis code is valid for ${expiresMinutes} minutes.\n\nIf you did not request this reset, you can safely ignore this email.\n\n---\nCareer Horizon`;

        const mailOptions = {
            from: fromAddress,
            to,
            subject: `[Career Horizon] ${otp} is your password reset code`,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Password reset email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error(`[Email Service] Error sending password reset email to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Verify transporter connection (useful for diagnostic test route).
 */
const verifyEmailConnection = async () => {
    const transporter = createTransporter();
    if (!transporter) {
        return {
            configured: false,
            message: "EMAIL_USER or EMAIL_PASS not configured in .env"
        };
    }
    try {
        await transporter.verify();
        return { configured: true, connected: true, message: "SMTP connection verified successfully" };
    } catch (err) {
        return { configured: true, connected: false, error: err.message };
    }
};

module.exports = {
    sendNotificationEmail,
    sendPasswordResetEmail,
    verifyEmailConnection
};
