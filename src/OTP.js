import { database } from "./firebase.config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";

const input = document.getElementById("findref");
const button = document.querySelector("button");
const message = document.getElementById("message");

button.addEventListener("click", () => {
  const enteredOtp = input.value.trim();
  message.textContent = "";
  message.style.color = "";

  if (enteredOtp === "") {
    Swal.fire({
      icon: "warning",
      title: "Missing Code",
      text: "Please enter your code.",
    });
    return;
  }

  const userRef = ref(database, "documentRequests");

  get(userRef)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        Swal.fire({
          icon: "error",
          title: "No Data",
          text: "No requests found.",
        });
        return;
      }

      let matchFound = false;

      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();

        if (data.otp === enteredOtp) {
          matchFound = true;

          Swal.fire({
            icon: "success",
            title: "Verified!",
            html: `
    <p>Your code has been verified successfully.</p>
     <p>You may now track your request.</p>
              <p><strong>Reference Number:</strong> <code>${data.referenceNumber}</code></p>
  `,
            confirmButtonText: "Continue",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            window.location.href = "track-status.html";
          });
        }
      });

      if (!matchFound) {
        message.textContent =
          " The code you entered is incorrect. Please try again.";
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "❌ An error occurred. Please try again later.",
      });
    });
});
