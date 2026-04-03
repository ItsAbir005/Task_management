import nodemailer from "nodemailer";
import config from "../config/config.js";

// Use port 587 (STARTTLS) instead of 465 (SSL) — more firewall-friendly
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,        // false = STARTTLS (upgrades after connect)
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: false,  // allow self-signed certs in dev
  },
  connectionTimeout: 10000,  // 10 second timeout instead of default 60s
  greetingTimeout: 10000,
});

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const mailOptions = {
    from: `"HRM SaaS" <${config.email.user}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error;
  }
};