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

const filterName = document.getElementById("searchInput");
const filterStatus = document.getElementById("statusFilter");
const filterDoc = document.getElementById("docTypeFilter");

let requestCache = [];

// Setup listener to fetch data
function setupListener() {
  if (userListener) {
    off(userRef, "value", userListener);
  }

  userListener = (snapshot) => {
    if (snapshot.exists()) {
      requestCache = Object.entries(snapshot.val());
      renderFilteredTable();
    } else {
      tablebody.innerHTML = `<tr><td colspan="6">No requests found.</td></tr>`;
    }
  };

  onValue(userRef, userListener);
}

setupListener();

// Render filtered table
function renderFilteredTable() {
  const searchTerm = filterName.value.trim().toLowerCase();
  const statusFilter = filterStatus.value.trim().toLowerCase();
  const docFilter = filterDoc.value.trim().toLowerCase();

  const filtered = requestCache.filter(([_, request]) => {
    const name = (request.fullname || "").toLowerCase();
    const refNum = (request.referenceNumber || "").toLowerCase();
    const status = (request.status || "Pending").trim().toLowerCase(); // Default to Pending
    const docType = (request.documentType || "").trim().toLowerCase();

    const matchesName =
      name.includes(searchTerm) || refNum.includes(searchTerm);
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesDoc = !docFilter || docType === docFilter;

    return matchesName && matchesStatus && matchesDoc;
  });

  tablebody.innerHTML = "";

  if (filtered.length === 0) {
    tablebody.innerHTML = `<tr><td colspan="6">No matching requests found.</td></tr>`;
    return;
  }

  filtered.forEach(([key, request]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Ref ID">${request.referenceNumber || "N/A"}</td>
      <td data-label="Full Name">${request.fullname}</td>
      <td data-label="Document Type">${request.documentType}</td>
      <td data-label="Date Requested">${request.Submit_time || "N/A"}</td>
      <td data-label="Status">${request.status || "Pending"}</td>
      <td data-label="Actions">
        <select class="status-select" data-id="${key}">
          <option ${
            request.status === "Pending" ? "selected" : ""
          }>Pending</option>
          <option ${
            request.status === "Processing" ? "selected" : ""
          }>Processing</option>
          <option ${
            request.status === "Completed" ? "selected" : ""
          }>Completed</option>
          <option ${
            request.status === "Rejected" ? "selected" : ""
          }>Rejected</option>
        </select>
        <button class="view-btn" data-id="${key}">Show Info</button>
      </td>
    `;
    tablebody.appendChild(row);
  });

  attachEventListeners();
}

// Attach event listeners for actions
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

        off(userRef, "value", userListener);

        if (newStatus === "Rejected") {
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
            status: "Rejected",
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

          if (newStatus === "Completed") {
            emailjs
              .send("service_xjgaz8u", "template_jclh5bh", {
                name: currentData.fullname,
                title: currentData.documentType,
                referenceNumber: currentData.referenceNumber,
                message:
                  "Pickup hours are Monday to Friday, 8:00 AM to 5:00 PM.",
                email: currentData.email,
              })
              .then(() => {
                Swal.fire(
                  "Completed",
                  `Email sent to ${currentData.email}`,
                  "success"
                );
              })
              .catch(() => {
                Swal.fire(
                  "Warning",
                  "Status updated but failed to send email.",
                  "warning"
                );
              });
          } else {
            Swal.fire("Status Updated", `New status: ${newStatus}`, "success");
          }
        }
      } catch (err) {
        console.error(err);
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
          <table style="width:100%; text-align:left;">
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
            <tr><td><strong>Valid ID:</strong></td>
              <td><a href="${
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
              Swal.fire("Error", "Could not delete the request.", "error");
            }
          }
        }
      });
    });
  });
}

// Debounced input filtering
let debounceTimeout;
filterName.addEventListener("input", () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(renderFilteredTable, 200);
});
filterStatus.addEventListener("change", renderFilteredTable);
filterDoc.addEventListener("change", renderFilteredTable);
