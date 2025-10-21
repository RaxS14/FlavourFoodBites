// public/otp.js

const sendBtn = document.getElementById("sendOTPBtn");
const verifyBtn = document.getElementById("verifyOTPBtn");
const emailInput = document.getElementById("forgotEmail");
const otpInput = document.getElementById("forgotOTP");
const newPassInput = document.getElementById("forgotNewPassword");
const otpMessage = document.getElementById("otpSentMessage");

let timerInterval = null;

function startTimer(duration = 60) {
  let timeLeft = duration;
  sendBtn.disabled = true;
  sendBtn.innerText = `Resend OTP in ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    sendBtn.innerText = `Resend OTP in ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      sendBtn.disabled = false;
      sendBtn.innerText = "Send OTP";
    }
  }, 1000);
}

// ===== Send OTP =====
sendBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) return alert("Please enter your email");

  const otp = Math.floor(100000 + Math.random() * 900000); // generate 6-digit OTP

  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (data.success) {
      otpMessage.innerText = `OTP sent to ${email}`;
      otpMessage.style.display = "block";
      localStorage.setItem("currentOTP", otp);
      startTimer();
    } else {
      otpMessage.innerText = data.error || "Failed to send OTP";
      otpMessage.style.display = "block";
    }
  } catch (err) {
    otpMessage.innerText = "Server error. Try again.";
    otpMessage.style.display = "block";
  }
});

// ===== Verify OTP =====
verifyBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();
  const newPass = newPassInput.value.trim();

  if (!email || !otp || !newPass) return alert("All fields required");

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (data.success) {
      alert("OTP verified! Password reset successful (mock).");
      // optionally reset form
      emailInput.value = "";
      otpInput.value = "";
      newPassInput.value = "";
      otpMessage.style.display = "none";
      document.getElementById("linkLoginFromOther").click();
    } else {
      alert(data.message || "Invalid OTP");
    }
  } catch (err) {
    alert("Server error. Try again.");
  }
});
