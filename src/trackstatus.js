// src/trackstatus.js
import { database } from "./firebase.config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

window.track = async function () {
  const refnumber = document.getElementById("email").value.trim();
  const resultBox = document.getElementById("result");
  const nameField = document.getElementById("name");
  const docTypeField = document.getElementById("docType");
  const statusField = document.getElementById("status");
  const message = document.getElementById("message");

  // Reset display
  resultBox.style.display = "none";
  nameField.textContent = "";
  docTypeField.textContent = "";
  statusField.textContent = "";
  message.textContent = "";

  if (!refnumber) {
    message.textContent = "Please enter your reference number.";
    message.style.color = "red";
    return;
  }

  try {
    const snapshot = await get(ref(database, "documentRequests"));
    let found = false;

    snapshot.forEach((child) => {
      const data = child.val();

      if (data.referenceNumber === refnumber) {
        const statusRaw = data.status || "Pending";
        const status = statusRaw.toLowerCase();

        nameField.textContent = data.fullname || "N/A";
        docTypeField.textContent = data.documentType || "N/A";
        statusField.textContent = statusRaw; // original case

        const statusClass =
          status === "completed"
            ? "completed"
            : status === "processing"
            ? "processing"
            : "pending";

        statusField.className = "status " + statusClass;
        resultBox.style.display = "block";
        message.textContent = "";
        found = true;
        return true; // stop loop
      }
    });

    if (!found) {
      message.textContent = "No request found with that reference number.";
      message.style.color = "red";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Something went wrong while checking your request.");
  }
};
