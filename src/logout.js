export function logout() {
  sessionStorage.removeItem("isAdminLoggedIn");
  window.location.href = "/admin.html";
}
window.logout = logout;
