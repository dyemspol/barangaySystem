import {
  database,
  ref,
  push,
  set,
  serverTimestamp,
} from "./firebase.config.js";

const form = document.querySelector("form");

// ======= AUTO-SAVE FORM DATA =======
// Restore data on load
window.addEventListener("load", () => {
  const savedData = JSON.parse(localStorage.getItem("formData"));
  if (savedData) {
    Object.keys(savedData).forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = savedData[key];
    });
  }
});

// Save data on input change
form.addEventListener("input", () => {
  const formData = {};
  [...form.elements].forEach((el) => {
    if ((el.name || el.id) && el.type !== "submit" && el.type !== "reset") {
      formData[el.name || el.id] = el.value;
    }
  });
  localStorage.setItem("formData", JSON.stringify(formData));
});

// Clear saved data on submit or reset
form.addEventListener("reset", () => localStorage.removeItem("formData"));

// ======= FORM SUBMISSION =======
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const captchaResponse = grecaptcha.getResponse();
  if (!captchaResponse) {
    Swal.fire({
      icon: "error",
      title: "CAPTCHA Required",
      text: "Please verify that you are not a robot.",
    });
    return;
  }

  const loaderModal = document.getElementById("loaderModal");
  const fullname = form.querySelector('input[name="fullName"]').value;
  const email = form.querySelector('input[name="email"]').value;
  const dob = form.querySelector('input[name="dob"]').value;
  const age = form.querySelector('input[name="age"]').value;
  const gender = form.querySelector('select[name="gender"]').value;
  const civilStatus = form.querySelector('select[name="civilStatus"]').value;
  const purok = form.querySelector('select[name="purok"]').value;
  const documentType = document.getElementById("documentType").value;
  const purpose = form.querySelector('input[name="purpose"]')?.value || "";

  const businessNameInput = document.querySelector(
    'input[name="businessName"]'
  );
  const validIDLinkInput = document.querySelector('input[name="validIDLink"]');

  const businessName = businessNameInput ? businessNameInput.value : "";
  const validIDLink = validIDLinkInput ? validIDLinkInput.value : "";

  const time = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  function generateRefNumber() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `BRGY-${datePart}-${randomPart}`;
  }

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const referenceNumber = generateRefNumber();
  const OTP = generateOTP();
  loaderModal.style.display = "flex";

  push(ref(database, "documentRequests/"), {
    referenceNumber,
    fullname,
    email,
    Birthday: dob,
    age,
    gender,
    civilStatus,
    purok,
    documentType,
    purpose,
    businessName,
    validIDLink,
    Submit_time: time,
    otp: OTP,
    label: "",
  })
    .then(() => {
      loaderModal.style.display = "none";
      Swal.fire({
        title: "Your document request has been successfully submitted.",
        icon: "success",
        html: `
          <p>Reference Number:</p>
          <strong style="font-size: 1.5em;">${referenceNumber}</strong>
          <p>Screenshot or save this number to check your status later.</p>
        `,
        confirmButtonText: "OK",
      });
      form.reset();
      localStorage.removeItem("formData"); // clear saved draft after submission
    })
    .catch((error) => {
      console.error(error);
      loaderModal.style.display = "none";
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    });
});
