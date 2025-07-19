import { database } from "./firebase.config.js";
import {
  ref,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("bt");

  button.addEventListener("click", (e) => {
    e.preventDefault(); // prevent form from submitting/refreshing

    const secretkeyinput = document.getElementById("secretkey").value.trim();
    const message = document.getElementById("p");

    if (!secretkeyinput) {
      message.textContent = "Please enter the secret key.";
      return;
    }

    const adminKey = "admin1";
    const refpath = ref(database, "adminAccounts/" + adminKey);

    get(refpath)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const databaseSecretKey = data.secretKey;

          if (secretkeyinput === databaseSecretKey) {
            update(refpath, {
              username: "admin",
              password: "admin123",
            })
              .then(() => {
                message.style.color = "green";
                message.textContent = "Admin credentials updated successfully!";
                setTimeout(() => {
                  window.location.href = "/admin.html";
                }, 2000); // 2000 milliseconds = 2 seconds
              })
              .catch((error) => {
                console.error(error);
                message.textContent = "Error updating admin.";
              });
          } else {
            message.textContent = "Invalid secret key.";
          }
        } else {
          message.textContent = "Admin account not found.";
        }
      })
      .catch((error) => {
        console.error(error);
        message.textContent = "Error reading admin data.";
      });
  });
});
