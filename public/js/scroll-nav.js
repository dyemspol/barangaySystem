const navigation = document.getElementById("navigation");

window.addEventListener("scroll", () => {
  if (window.scrollY >= 100) {
    navigation.classList.add("activate");
  } else {
    navigation.classList.remove("activate");
  }
});
