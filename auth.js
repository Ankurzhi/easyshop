function setupNavbarAuth() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const userStr = localStorage.getItem("user");

  if (userStr) {
    const user = JSON.parse(userStr);
    const firstName = user.name ? user.name.split(" ")[0] : "User";

    authArea.innerHTML = `
      <span style="color:#fff; margin-right:8px;">Hi, ${firstName}</span>
      <a href="#" id="logoutLink">Logout</a>
    `;

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  } else {
    authArea.innerHTML = `
      <a href="login.html">Login</a> /
      <a href="signup.html">Signup</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", setupNavbarAuth);
