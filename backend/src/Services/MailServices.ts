import nodemailer from "nodemailer";
import config from "../config/config.js";

// transporter banao (SMTP/Gmail ke liye)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: config.email.user,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error;
  }
};