// src/additional-input.js
const documentType = document.getElementById("documentType");
const extraFields = document.getElementById("extraFields");

documentType.addEventListener("change", () => {
  const value = documentType.value;
  extraFields.innerHTML = "";

  const uploadNote = `
    <small style="margin-bottom: 0.4em; display: block;">
      Upload your valid ID to <strong>Google Drive</strong> or 
      <a href="https://imgbb.com/" target="_blank" style="color: #3e12aeff; text-decoration: underline; font-weight: bold;">ImgBB</a>, 
      then paste the shareable link below.  
    </small>
    <input
      type="url"
      name="validIDLink"
      placeholder="Paste Google Drive link here"
      required
    />
    <input
      type="text"
      name="purpose"
      placeholder="Purpose"
      required
    />
  `;

  if (
    value === "barangay-clearance" ||
    value === "certificate-indigency" ||
    value === "activity-permit" ||
    value === "certificate-residency" ||
    value === "barangay-certificate"
  ) {
    extraFields.innerHTML = uploadNote;
  } else if (value === "business-permit") {
    extraFields.innerHTML = `
      <input
        type="text"
        name="businessName"
        placeholder="Name of the business"
        required
      />
      ${uploadNote}
    `;
  }
});
