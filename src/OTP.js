import { database } from "./firebase.config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";

const input = document.getElementById("findref");
const button = document.querySelector("button");
const message = document.getElementById("message");

let countdownInterval;
let currentOtpData = null; // to store OTP + expiry from Firebase

// === Fetch OTP and start countdown ===
async function loadOtpData() {
  try {
    const userRef = ref(database, "documentRequests");
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      message.textContent = "No OTP found. Please request a new one.";
      message.style.color = "red";
      input.disabled = true;
      button.disabled = true;
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.otp && data.otpExpiry) {
        currentOtpData = {
          otp: data.otp,
          expiry: data.otpExpiry,
          referenceNumber: data.referenceNumber,
        };
      }
    });

    if (!currentOtpData) {
      message.textContent = "OTP expired or not available. Request a new one.";
      message.style.color = "red";
      input.disabled = true;
      button.disabled = true;
      return;
    }

    startCountdown(currentOtpData.expiry);
  } catch (error) {
    console.error("Error loading OTP data:", error);
    message.textContent = "Error fetching OTP. Try again later.";
    message.style.color = "red";
  }
}

// === Countdown Setup ===
function startCountdown(expiryTime) {
  function updateCountdown() {
    const remaining = expiryTime - Date.now();

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      message.textContent = "OTP expired. Please request a new code.";
      message.style.color = "red";
      input.disabled = true;
      button.disabled = true;
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

// === OTP Verification ===
button.addEventListener("click", () => {
  const enteredOtp = input.value.trim();

  if (!currentOtpData) {
    Swal.fire({
      icon: "error",
      title: "OTP Expired",
      text: "Your OTP has expired or is unavailable. Please request a new one.",
    });
    return;
  }

  if (Date.now() > currentOtpData.expiry) {
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

// Load OTP when page opens
loadOtpData();
