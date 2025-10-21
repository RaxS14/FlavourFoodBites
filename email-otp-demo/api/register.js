import { readFileSync, writeFileSync, existsSync } from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method Not Allowed" });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "All fields are required" });

  const file = "./users.json";
  let users = existsSync(file) ? JSON.parse(readFileSync(file, "utf-8")) : [];
  if (users.find(u => u.email === email))
    return res.json({ success: false, message: "Email already exists" });

  users.push({ email, password });
  writeFileSync(file, JSON.stringify(users, null, 2));

  // Generate OTP for registration
  const otp = Math.floor(100000 + Math.random() * 900000);
  global.otpStore = global.otpStore || {};
  global.otpStore[email] = { otp, createdAt: Date.now() };

  // Dummy email: just log OTP
  console.log(`📧 Registration OTP for ${email}: ${otp}`);

  return res.json({
    success: true,
    message: "Registered successfully! OTP sent to your dummy email (check console)."
  });
}
