if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {
  window.location.href = "/admin.html"; // or login page
}
