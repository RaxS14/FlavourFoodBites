import nodemailer from "nodemailer";
import { readFileSync, existsSync } from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Only POST requests allowed" });

  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "Email and OTP are required" });

  // Check if email is registered
  const file = "./users.json";
  if (!existsSync(file)) return res.status(400).json({ success: false, error: "No users registered" });

  const users = JSON.parse(readFileSync(file));
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ success: false, error: "Email not registered" });

  try {
    // Store OTP in global memory for verification
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = { otp, createdAt: Date.now() };

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP email
    await transporter.sendMail({
      from: `"Flavour Food Bites 🍽️" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Flavour Food Bites - Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>🍴 Flavour Food Bites</h2>
          <p>Hello!</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h2 style="color: #e67e22;">${otp}</h2>
          <p>This code will expire in <b>5 minutes</b>.</p>
          <p>Thank you for choosing <b>Flavour Food Bites</b>! 🍽️</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${email}`);
    res.status(200).json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    console.error("❌ Failed to send OTP:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
}
