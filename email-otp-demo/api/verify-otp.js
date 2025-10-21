import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method Not Allowed" });

  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });

  // Check OTP
  global.otpStore = global.otpStore || {};
  const record = global.otpStore[email];
  if (!record)
    return res.status(400).json({ success: false, message: "No OTP found for this email" });

  const isExpired = Date.now() - record.createdAt > 5 * 60 * 1000; // 5 minutes
  if (isExpired) {
    delete global.otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== otp)
    return res.status(400).json({ success: false, message: "Invalid OTP" });

  // OTP verified, remove from store
  delete global.otpStore[email];

  // Update user password in users.json
  try {
    const usersFilePath = path.join(process.cwd(), "users.json");
    const usersData = fs.existsSync(usersFilePath)
      ? JSON.parse(fs.readFileSync(usersFilePath, "utf-8"))
      : [];

    const userIndex = usersData.findIndex(u => u.email === email);
    if (userIndex === -1)
      return res.status(400).json({ success: false, message: "User not found" });

    usersData[userIndex].password = newPassword;
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), "utf-8");

    return res.status(200).json({ success: true, message: "Password reset successfully!" });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
