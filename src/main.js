// src/main.js
import {
  database,
  ref,
  push,
  set,
  serverTimestamp,
} from "./firebase.config.js";

const form = document.querySelector("form");

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

  const loader = document.getElementById("loader");
  const fullname = form.querySelector('input[placeholder="Full name"]').value;
  const email = form.querySelector('input[placeholder="Email"]').value;
  const dob = form.querySelector('input[type="date"]').value;
  const age = form.querySelector('input[placeholder="Age"]').value;
  const gender = form.querySelectorAll("select")[0].value;
  const civilStatus = form.querySelectorAll("select")[1].value;
  const purok = form.querySelectorAll("select")[2].value;
  const documentType = document.getElementById("documentType").value;
  const purpose = form.querySelector('input[placeholder="Purpose"]').value;

  const businessNameInput = document.querySelector(
    'input[placeholder="Name of the business"]'
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
    })
    .catch((error) => {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    });
});
