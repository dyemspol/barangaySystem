import { database } from "./firebase.config.js";
import {
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const adminkey = "admin1";
const adminRef = ref(database, "adminAccounts/" + adminkey);

// DOM elements
const usernameInput = document.getElementById("new-username");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("newpassword");
const confirmPasswordInput = document.getElementById("confirm-password");
const message = document.getElementById("message");
const button = document.getElementById("bt");

button.addEventListener("click", async () => {
  const newUsername = usernameInput.value.trim();
  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Validate required fields
  if (!currentPassword) {
    message.textContent = "Please enter your current password.";
    return;
  }

  const isChangingUsername = newUsername !== "";
  const isChangingPassword = newPassword !== "" && confirmPassword !== "";

  if (!isChangingUsername && !isChangingPassword) {
    message.textContent =
      "Please provide a new username or both new password fields.";
    return;
  }

  if (isChangingPassword && newPassword !== confirmPassword) {
    message.textContent = "New passwords do not match.";
    return;
  }

  try {
    const snapshot = await get(adminRef);

    if (!snapshot.exists()) {
      message.textContent = "Admin data not found.";
      return;
    }

    const adminData = snapshot.val();

    // Check current password
    if (currentPassword !== adminData.password) {
      message.textContent = "Current password is incorrect.";
      return;
    }

    // Prepare updated data
    const updatedData = {
      username: isChangingUsername ? newUsername : adminData.username,
      password: isChangingPassword ? newPassword : adminData.password,
    };

    // Update Firebase
    await update(adminRef, updatedData);

    // Clear inputs
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
      window.location.href = "../../admin.html";
    });
  } catch (error) {
    console.error(error);
    message.textContent = "Error updating credentials.";
    Swal.fire("Error", "Failed to update credentials.", "error");
  }
});
