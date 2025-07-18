import { database } from "./firebase.config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";

window.login = async function () {
  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value;
  const errorDisplay = document.getElementById("p");

  // ✅ Check CAPTCHA
  const captchaResponse = grecaptcha.getResponse();
  if (!captchaResponse) {
    errorDisplay.style.color = "red";
    errorDisplay.textContent = "⚠️ Please complete the CAPTCHA.";
    return;
  }

  const adminRef = ref(database, "adminAccounts");

  try {
    const snapshot = await get(adminRef);

    if (snapshot.exists()) {
      let valid = false;

      snapshot.forEach((child) => {
        const { username, password } = child.val();
        if (username === usernameInput && password === passwordInput) {
          valid = true;
        }
      });

      if (valid) {
        errorDisplay.style.color = "green";
        errorDisplay.textContent = "✅ Login successful!";
        sessionStorage.setItem("isAdminLoggedIn", "true");

        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = "admin_page.html";
        }, 1000);
      } else {
        errorDisplay.style.color = "red";
        errorDisplay.textContent = "❌ Invalid username or password.";
      }
    } else {
      errorDisplay.style.color = "red";
      errorDisplay.textContent = "⚠️ No admin accounts found.";
    }
  } catch (err) {
    console.error("Login error:", err);
    errorDisplay.style.color = "red";
    errorDisplay.textContent = "❌ Error connecting to database.";
  }
};
