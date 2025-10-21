// ===== server.js =====
require('dotenv').config(); // Load your .env file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== In-Memory OTP Storage =====
let otpStore = {}; // { email: { otp, otpExpiry } }

// ===== Helper Function =====
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// ===== Nodemailer Transporter =====
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Optional: test transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter ready to send messages');
  }
});

// ===== Routes =====

// Register (mock)
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: 'Email and password required' });

  return res.json({ success: true, message: 'Registration successful (mock)' });
});

// Login (mock)
app.post('/login-credentials', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: 'Email and password required' });

  return res.json({ success: true, message: 'Login successful (mock)' });
});

// ===== Send OTP =====
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });

  const otp = generateOTP();
  const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore[email] = { otp, otpExpiry };

  try {
    await transporter.sendMail({
      from: `"Flavour Food Bites 🍽️" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Flavour Food Bites - Your OTP Code',
      text: `Hello from Flavour Food Bites!\n\nYour OTP code is: ${otp}\nThis code will expire in 5 minutes.\n\n🍽️ Thank you for choosing Flavour Food Bites!`
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    res.json({ success: false, message: 'Failed to send OTP email' });
  }
});

// ===== Verify OTP =====
app.post('/verify-otp', (req, res) => {
  const { email, otp, newPass } = req.body;
  if (!email || !otp || !newPass)
    return res.json({ success: false, message: 'All fields required' });

  const record = otpStore[email];
  if (!record || record.otp !== otp)
    return res.json({ success: false, message: 'Invalid OTP' });
  if (Date.now() > record.otpExpiry)
    return res.json({ success: false, message: 'OTP expired' });

  delete otpStore[email];
  return res.json({ success: true, message: 'Password reset successful (mock)' });
});

// ===== Default Route =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
