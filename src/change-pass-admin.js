import { database } from "./firebase.config.js";
import {
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Firebase reference
const adminkey = "admin1";
const adminRef = ref(database, "adminAccounts/" + adminkey);

// DOM elements
const usernameInput = document.getElementById("new-username");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("newpassword");
const confirmPasswordInput = document.getElementById("confirm-password");
const message = document.getElementById("message");
const button = document.getElementById("bt");

// Click handler
button.addEventListener("click", () => {
  const newUsername = usernameInput.value.trim();
  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Get current admin data
  get(adminRef)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        message.textContent = "Admin data not found.";
        return;
      }

      const adminData = snapshot.val();

      // Validate current password
      if (currentPassword !== adminData.password) {
        message.textContent = "Current password is incorrect.";
        return;
      }

      // Check password confirmation
      if (newPassword !== confirmPassword) {
        message.textContent = "New passwords do not match.";
        return;
      }

      // Prepare updated data
      const updatedData = {
        username: newUsername || adminData.username, // keep old if blank
        password: newPassword,
      };

      // Update in Firebase
      return update(adminRef, updatedData);
    })
    .then(() => {
      // If update was successful, reset inputs and redirect
      usernameInput.value = "";
      currentPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Credentials updated successfully.",
      }).then(() => {
        sessionStorage.removeItem("isAdminLoggedIn");
        window.location.href = "/admin.html";
      });
    })
    .catch((error) => {
      console.error(error);
      message.textContent = "Failed to update credentials.";
      Swal.fire("Error", "Something went wrong during update.", "error");
    });
});
function logout() {
  sessionStorage.removeItem("isAdminLoggedIn");
  window.location.href = "admin.html";
}
