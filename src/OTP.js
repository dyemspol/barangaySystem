import { database } from "./firebase.config.js";
import {
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";

const input = document.getElementById("findref");
const button = document.querySelector("button");
const message = document.getElementById("message");
const resendLink = document.getElementById("resendLink");

let countdownInterval;
let currentOtpData = null; // stores OTP, expiry, referenceNumber, key, email, fullname

// === Load OTP and start countdown ===
async function loadOtpData() {
  try {
    const userRef = ref(database, "documentRequests");
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      showExpiredMessage();
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.otp && data.otpExpiry) {
        currentOtpData = {
          otp: data.otp,
          expiry: data.otpExpiry,
          referenceNumber: data.referenceNumber,
          key: childSnapshot.key,
          email: data.email,
          fullname: data.fullname,
        };
      }
    });

    if (!currentOtpData) {
      showExpiredMessage();
      return;
    }

    startCountdown(currentOtpData.expiry);
  } catch (error) {
    console.error("Error loading OTP data:", error);
    message.textContent = "Error fetching OTP. Try again later.";
    message.style.color = "red";
  }
}

// === Countdown Timer ===
function startCountdown(expiryTime) {
  clearInterval(countdownInterval);

  function updateCountdown() {
    const remaining = expiryTime - Date.now();

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      showExpiredMessage();
    } else {
      const minutes = Math.floor((remaining / 1000 / 60) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      message.textContent = `This OTP will expire in ${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
      message.style.color = "black";
    }
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// === Show OTP Expired Message ===
function showExpiredMessage() {
  message.textContent = "OTP expired. Please request a new code.";
  message.style.color = "red";
  input.disabled = false;
  button.disabled = false;
}

// === Verify OTP ===
button.addEventListener("click", () => {
  const enteredOtp = input.value.trim();

  if (!currentOtpData || Date.now() > currentOtpData.expiry) {
    Swal.fire({
      icon: "error",
      title: "OTP Expired",
      text: "Your OTP has expired. Please request a new one.",
    });
    return;
  }

  if (enteredOtp === "") {
    Swal.fire({
      icon: "warning",
      title: "Missing Code",
      text: "Please enter your code.",
    });
    return;
  }

  if (enteredOtp === currentOtpData.otp) {
    Swal.fire({
      icon: "success",
      title: "Verified!",
      html: `
        <p>Your code has been verified successfully.</p>
        <p>You may now track your request.</p>
        <p><strong>Reference Number:</strong> <code>${currentOtpData.referenceNumber}</code></p>
      `,
      confirmButtonText: "Continue",
      confirmButtonColor: "#3085d6",
    }).then(() => {
      window.location.href = "track-status.html";
    });
  } else {
    message.textContent =
      "The code you entered is incorrect. Please try again.";
    message.style.color = "red";
  }
});

// === Resend OTP Logic ===
resendLink.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!currentOtpData || !currentOtpData.key) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No request found. Please go back and try again.",
    });
    return;
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  try {
    // Update Firebase with new OTP
    await update(ref(database, `documentRequests/${currentOtpData.key}`), {
      otp: newOtp,
      otpExpiry: newExpiry,
    });

    // Send Email via EmailJS
    await emailjs.send("service_xjgaz8u", "template_ggx0gmc", {
      fullname: currentOtpData.fullname,
      otp: newOtp,
      email: currentOtpData.email,
    });

    Swal.fire({
      icon: "success",
      title: "OTP Resent!",
      text: "A new OTP has been sent to your email.",
    });

    // Update local data and restart countdown
    currentOtpData.otp = newOtp;
    currentOtpData.expiry = newExpiry;
    startCountdown(newExpiry);
  } catch (error) {
    console.error("Error resending OTP:", error);
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: "Could not resend OTP. Please try again.",
    });
  }
});

// === Load OTP on page load ===
loadOtpData();
