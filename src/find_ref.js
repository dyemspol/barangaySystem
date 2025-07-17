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
const loader = document.getElementById("loader");
findButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const documentType = docTypeSelect.value;

  messageBox.textContent = ""; // Clear old message

  if (!email || !documentType) {
    messageBox.textContent =
      "Please enter your email and select a document type.";
    messageBox.style.color = "red";
    return;
  }

  const userRef = ref(database, "documentRequests/");

  try {
    loader.style.display = "flex";
    const snapshot = await get(userRef);
    let matchFound = false;

    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const key = childSnapshot.key;

      if (
        data.email.toLowerCase() === email &&
        data.documentType === documentType
      ) {
        matchFound = true;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update Firebase with OTP
        update(ref(database, `documentRequests/${key}`), { otp })
          .then(() => {
            // Send OTP email
            return emailjs.send("service_xjgaz8u", "template_ggx0gmc", {
              fullname: data.fullname,
              otp: otp,
              email: data.email,
            });
          })
          .then(() => {
            loader.style.display = "none";
            // Show success alert
            Swal.fire({
              icon: "success",
              title: "OTP Sent!",
              text: "The OTP has been sent to your email.",
              confirmButtonText: "Continue",
            }).then(() => {
              window.location.href = "OTP.html";
            });
          })
          .catch((err) => {
            console.error("OTP Email or DB error:", err);
            messageBox.textContent =
              "❌ Failed to process OTP. Please try again.";
            messageBox.style.color = "red";
          });
      }
    });

    if (!matchFound) {
      messageBox.textContent =
        "❌ No request found with that email and document type.";
      messageBox.style.color = "red";
    }
  } catch (error) {
    console.error("Firebase get() error:", error);
    messageBox.textContent = "❌ Database error. Please try again later.";
    messageBox.style.color = "red";
  }
});
