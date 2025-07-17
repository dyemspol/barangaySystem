const burger = document.querySelector(".menu-bt");
const mobileMenu = document.querySelector(".mobile-menulinks");
const header = document.querySelector("header");

burger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");

  // ✅ Apply or remove background on header
  if (mobileMenu.classList.contains("open")) {
    header.classList.add("activate");
  } else {
    header.classList.remove("activate");
  }
});
