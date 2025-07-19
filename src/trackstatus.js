// src/trackstatus.js
import { database } from "./firebase.config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import "/src/nav_tonggle.js";
window.track = async function () {
  const refnumber = document.getElementById("email").value.trim();
  const resultBox = document.getElementById("result");
  const nameField = document.getElementById("name");
  const docTypeField = document.getElementById("docType");
  const statusField = document.getElementById("status");
  const message = document.getElementById("message");
  const reasonField = document.getElementById("reason");
  const reasonContainer = document.getElementById("reasonContainer");

  // Reset display
  resultBox.style.display = "none";
  nameField.textContent = "";
  docTypeField.textContent = "";
  statusField.textContent = "";
  message.textContent = "";
  reasonField.value = "";
  reasonContainer.style.display = "none";

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
        statusField.textContent = statusRaw;

        const statusClass =
          status === "completed"
            ? "completed"
            : status === "processing"
            ? "processing"
            : status === "rejected"
            ? "rejected"
            : "pending";

        statusField.className = "status " + statusClass;

        if (status === "rejected") {
          reasonField.value = data.label || "No reason provided.";
          reasonContainer.style.display = "block";
        }

        resultBox.style.display = "block";
        message.textContent = "";
        found = true;
        return true;
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
