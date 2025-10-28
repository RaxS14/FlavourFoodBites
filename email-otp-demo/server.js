// ===== server.js =====
require('dotenv').config(); // Load .env variables
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
let otpStore = {}; // Structure: { email: { otp, otpExpiry } }

// ===== Helper Function =====
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ===== Nodemailer Transporter =====
const transporter = nodemailer.createTransport({
  service: 'gmail', // Simplified, works best with Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Optional: Test transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter ready');
  }
});

// ===== ROUTES =====

// --- Mock Register ---
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: 'Email and password required' });

  res.json({ success: true, message: 'Registration successful (mock)' });
});

// --- Mock Login ---
app.post('/login-credentials', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: 'Email and password required' });

  res.json({ success: true, message: 'Login successful (mock)' });
});

// --- Send OTP ---
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });

  const otp = generateOTP();
  const otpExpiry = Date.now() + 5 * 60 * 1000; // Expires in 5 mins
  otpStore[email] = { otp, otpExpiry };

  try {
    await transporter.sendMail({
      from: `"Flavour Food Bites 🍽️" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Flavour Food Bites - OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.\n\n🍽️ Thank you for ordering with Flavour Food Bites!`
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    console.error('❌ Failed to send OTP email:', err);
    res.json({ success: false, message: 'Failed to send OTP email' });
  }
});

// --- Verify OTP ---
app.post('/verify-otp', (req, res) => {
  const { email, otp, newPass } = req.body;
  if (!email || !otp || !newPass)
    return res.json({ success: false, message: 'All fields required' });

  const record = otpStore[email];
  if (!record) return res.json({ success: false, message: 'No OTP found for this email' });
  if (record.otp !== otp) return res.json({ success: false, message: 'Invalid OTP' });
  if (Date.now() > record.otpExpiry) return res.json({ success: false, message: 'OTP expired' });

  delete otpStore[email]; // Remove OTP after successful verification
  res.json({ success: true, message: 'Password reset successful (mock)' });
});

// --- Send Order Status Email ---
app.post('/notify-status', async (req, res) => {
  const { email, orderId, status } = req.body;
  if (!email || !orderId || !status)
    return res.json({ success: false, message: 'Missing email, orderId, or status' });

  const mailOptions = {
    from: `"Flavour Food Bites 🍔" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order #${orderId} - Status Update`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #ff6b35;">Flavour Food Bites - Order Update</h2>
        <p>Hello!</p>
        <p>Your order <strong>#${orderId}</strong> status has been updated to:</p>
        <h3 style="color:#ff6b35;">${status}</h3>
        <p>Thank you for ordering with <b>Flavour Food Bites</b> 🍔</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order status email sent to ${email} for Order #${orderId}`);
    res.json({ success: true, message: 'Order status email sent successfully' });
  } catch (err) {
    console.error('❌ Failed to send status email:', err);
    res.json({ success: false, message: 'Failed to send status email' });
  }
});

// --- Default Route ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
