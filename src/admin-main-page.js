import { database } from "./firebase.config.js";
import {
  ref,
  get,
  onValue,
  off,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";

const tablebody = document.getElementById("tablebody");
const userRef = ref(database, "documentRequests/");
let userListener = null;

function setupListener() {
  if (userListener) {
    off(userRef, "value", userListener);
  }

  userListener = (snapshot) => {
    tablebody.innerHTML = "";

    let totalCount = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let processingCount = 0;
    let rejectCount = 0;

    const today = new Date();
    const todayString = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    if (snapshot.exists()) {
      const data = snapshot.val();

      Object.entries(data).forEach(([key, request]) => {
        if (!request.Submit_time) return;

        let requestDate;
        // Handle both timestamp and string date formats
        if (typeof request.Submit_time === "number") {
          requestDate = new Date(request.Submit_time);
        } else {
          requestDate = new Date(request.Submit_time);
        }

        const requestDateString = requestDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        if (requestDateString !== todayString) return; // Show only today's requests

        totalCount++;

        const status = request.status?.toLowerCase() || "pending";
        if (status === "pending") pendingCount++;
        else if (status === "completed") completedCount++;
        else if (status === "processing") processingCount++;
        else if (status === "rejected") rejectCount++;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td data-label="Ref ID">${request.referenceNumber || "N/A"}</td>
          <td data-label="Full Name">${request.fullname}</td>
          <td data-label="Document Type">${request.documentType}</td>
          <td data-label="Date Requested">${request.Submit_time || "N/A"}</td>
          <td data-label="Status">
            <span class="status ${status}">${request.status || "Pending"}</span>
          </td>
          <td data-label="Actions">
            <select class="status-select" data-id="${key}">
              <option ${status === "pending" ? "selected" : ""}>Pending</option>
              <option ${
                status === "processing" ? "selected" : ""
              }>Processing</option>
              <option ${
                status === "completed" ? "selected" : ""
              }>Completed</option>
              <option ${
                status === "rejected" ? "selected" : ""
              }>Rejected</option>
            </select>
            <button class="view-btn" data-id="${key}">Show Info</button>
          </td>
        `;
        tablebody.appendChild(row);
      });

      document.getElementById("totalCount").textContent = totalCount;
      document.getElementById("pendingCount").textContent = pendingCount;
      document.getElementById("completeCount").textContent = completedCount;
      document.getElementById("processingCount").textContent = processingCount;
      document.getElementById("rejectCount").textContent = rejectCount;

      if (totalCount === 0) {
        tablebody.innerHTML = `<tr><td colspan="6">No requests found for today.</td></tr>`;
      }

      attachEventListeners();
    } else {
      tablebody.innerHTML = `<tr><td colspan="6">No requests found for today.</td></tr>`;
    }
  };

  onValue(userRef, userListener);
}

setupListener();

function attachEventListeners() {
  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const newStatus = e.target.value;
      const id = e.target.dataset.id;

      try {
        const snap = await get(ref(database, "documentRequests/" + id));
        if (!snap.exists()) return;

        const currentData = snap.val();
        if (currentData.status === newStatus) return;

        if (userListener) off(userRef, "value", userListener);

        if (newStatus.toLowerCase() === "rejected") {
          const { value: reason } = await Swal.fire({
            title: "Reject Reason",
            input: "textarea",
            inputLabel: "Enter the reason for rejection",
            inputPlaceholder: "Type reason here...",
            showCancelButton: true,
          });

          if (reason === undefined) {
            Swal.fire("Cancelled", "Status unchanged.", "info");
            setupListener();
            return;
          }

          await update(ref(database, "documentRequests/" + id), {
            status: "rejected",
            label: reason,
          });

          Swal.fire(
            "Rejected",
            "Request has been marked as rejected.",
            "success"
          );
        } else {
          await update(ref(database, "documentRequests/" + id), {
            status: newStatus,
            label: "",
          });

          if (newStatus.toLowerCase() === "completed") {
            emailjs
              .send("service_xjgaz8u", "template_jclh5bh", {
                name: currentData.fullname,
                title: currentData.documentType,
                referenceNumber: currentData.referenceNumber,
                message:
                  "Pickup hours are Monday to Friday, 8:00 AM to 5:00 PM.",
                email: currentData.email,
              })
              .then((res) => {
                console.log("✅ Email sent:", res.status, res.text);
                Swal.fire(
                  "Status Updated",
                  `Marked as Completed. Email sent to ${currentData.email}`,
                  "success"
                );
              })
              .catch((error) => {
                console.error("❌ EmailJS error:", error);
                Swal.fire(
                  "Status Updated",
                  `Marked as Completed, but failed to send email.`,
                  "warning"
                );
              });
          } else {
            Swal.fire("Status Updated", `New status: ${newStatus}`, "success");
          }
        }
      } catch (err) {
        console.error("Status update error:", err);
        Swal.fire("Error", "Could not update status.", "error");
      } finally {
        setupListener();
      }
    });
  });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const snap = await get(ref(database, "documentRequests/" + id));
      if (!snap.exists()) return;

      const r = snap.val();

      Swal.fire({
        title: "Request Details",
        html: `
          <table style="width:100%; text-align:left; border-spacing: 0.5em;">
            <tr><td><strong>Full Name:</strong></td><td>${r.fullname}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${r.email}</td></tr>
            <tr><td><strong>DOB:</strong></td><td>${r.Birthday}</td></tr>
            <tr><td><strong>Age:</strong></td><td>${r.age}</td></tr>
            <tr><td><strong>Gender:</strong></td><td>${r.gender}</td></tr>
            <tr><td><strong>Civil Status:</strong></td><td>${
              r.civilStatus
            }</td></tr>
            <tr><td><strong>Purok:</strong></td><td>${r.purok}</td></tr>
            <tr><td><strong>Purpose:</strong></td><td>${
              r.purpose || "N/A"
            }</td></tr>
            <tr><td><strong>Document Type:</strong></td><td>${
              r.documentType
            }</td></tr>
            ${
              r.documentType?.toLowerCase() === "business-permit"
                ? `<tr><td><strong>Business Name:</strong></td><td>${
                    r.businessName || "N/A"
                  }</td></tr>`
                : ""
            }
            <tr><td><strong>Reference Number:</strong></td><td>${
              r.referenceNumber
            }</td></tr>
            <tr><td><strong>Status:</strong></td><td>${
              r.status || "Pending"
            }</td></tr>
            <tr><td><strong>Date Submitted:</strong></td><td>${
              r.Submit_time || "N/A"
            }</td></tr>
            <tr><td><strong>Valid ID:</strong></td><td><a href="${
              r.validIDLink
            }" target="_blank">View Uploaded ID</a></td></tr>
          </table>
        `,
        icon: "info",
        width: 550,
        showCancelButton: true,
        confirmButtonText: "Close",
        cancelButtonText: "Delete",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          const confirmDelete = await Swal.fire({
            title: "Are you sure?",
            text: "This request will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
          });

          if (confirmDelete.isConfirmed) {
            try {
              off(userRef, "value", userListener);
              await remove(ref(database, "documentRequests/" + id));
              Swal.fire(
                "Deleted!",
                "The request has been deleted.",
                "success"
              ).then(() => {
                setupListener();
              });
            } catch (err) {
              console.error("Deletion error:", err);
              Swal.fire("Error", "Could not delete the request.", "error");
            }
          }
        }
      });
    });
  });
}
