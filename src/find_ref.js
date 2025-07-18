import { database } from "./firebase.config.js";
import {
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";

const findButton = document.querySelector("button[type='submit']");
const emailInput = document.getElementById("findref");
const docTypeSelect = document.getElementById("documentType");
const messageBox = document.querySelector(".message");
const loader = document.getElementById("loaderModal");

findButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const documentType = docTypeSelect.value;

  messageBox.textContent = "";

  if (!email || !documentType) {
    messageBox.textContent =
      "Please enter your email and select a document type.";
    messageBox.style.color = "red";
    return;
  }

  const userRef = ref(database, "documentRequests/");
  loader.style.display = "flex";

  try {
    console.log("📡 Fetching data from Firebase...");
    const snapshot = await get(userRef);
    console.log("✅ Firebase get() success");

    if (!snapshot.exists()) {
      messageBox.textContent = "❌ No data found in the database.";
      messageBox.style.color = "red";
      loader.style.display = "none";
      return;
    }

    let matchFound = false;

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const key = childSnapshot.key;

      console.log("🔍 Checking entry:", data.email, data.documentType);

      if (
        data.email.toLowerCase() === email &&
        data.documentType === documentType
      ) {
        matchFound = true;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now
        console.log("🔐 Match found. Generated OTP:", otp);

        update(ref(database, `documentRequests/${key}`), { otp, otpExpiry })
          .then(() => {
            console.log("✅ OTP and expiry saved to database");

            // Send Email using EmailJS
            return emailjs.send("service_xjgaz8u", "template_ggx0gmc", {
              fullname: data.fullname,
              otp: otp,
              email: data.email,
            });
          })
          .then(() => {
            loader.style.display = "none";
            console.log("📨 Email sent successfully");

            // Store expiry in localStorage for countdown timer on OTP page
            localStorage.setItem("otpExpiry", otpExpiry);

            Swal.fire({
              icon: "success",
              title: "OTP Sent!",
              text: "The OTP has been sent to your email. It is valid for 5 minutes.",
              confirmButtonText: "Continue",
            }).then(() => {
              window.location.href = "OTP.html";
            });
          })
          .catch((err) => {
            console.error("❌ EmailJS or Firebase error:", err);
            messageBox.textContent =
              "❌ Failed to process OTP. Please try again.";
            messageBox.style.color = "red";
            loader.style.display = "none";
          });
      }
    });

    if (!matchFound) {
      console.warn("❌ No matching request found.");
      messageBox.textContent =
        "❌ No request found with that email and document type.";
      messageBox.style.color = "red";
      loader.style.display = "none";
    }
  } catch (error) {
    console.error("🔥 Firebase read failed:", error);
    messageBox.textContent = "❌ Database error. Please try again later.";
    messageBox.style.color = "red";
    loader.style.display = "none";
  }
});
