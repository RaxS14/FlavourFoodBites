export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  global.otpStore = global.otpStore || {};
  const record = global.otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, message: "No OTP found for this email" });
  }

  const isExpired = Date.now() - record.createdAt > 5 * 60 * 1000; // 5 minutes
  if (isExpired) {
    delete global.otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // OTP verified, remove from store
  delete global.otpStore[email];
  return res.status(200).json({ success: true, message: "OTP verified successfully!" });
}
