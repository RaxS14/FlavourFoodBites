import { readFileSync, existsSync } from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, error: "Only POST requests allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const file = "./users.json";
  if (!existsSync(file)) return res.status(400).json({ success: false, error: "No users registered" });

  const users = JSON.parse(readFileSync(file, "utf-8"));
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ success: false, error: "Email not registered" });

  // Generate OTP for forgot password
  const otp = Math.floor(100000 + Math.random() * 900000);
  global.otpStore = global.otpStore || {};
  global.otpStore[email] = { otp, createdAt: Date.now() };

  // Dummy email: just log OTP
  console.log(`📧 Forgot Password OTP for ${email}: ${otp}`);

  res.status(200).json({ success: true, message: `OTP sent to ${email} (check console).` });
}
