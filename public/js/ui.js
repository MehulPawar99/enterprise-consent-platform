// ui.js
document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutBtn2 = document.getElementById("logoutBtn2");
    const profileBtn = document.getElementById("profileBtn");
    const profileMenu = document.getElementById("profileMenu");

    // =======================
    // THEME TOGGLE
    // =======================
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.remove("dark", "light");
    document.body.classList.add(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isDark = document.body.classList.contains("dark");
            const newTheme = isDark ? "light" : "dark";

            document.body.classList.remove("dark", "light");
            document.body.classList.add(newTheme);

            localStorage.setItem("theme", newTheme);
        });
    }

    // =======================
    // LOGOUT
    // =======================
    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    }

    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (logoutBtn2) logoutBtn2.addEventListener("click", logout);

    // =======================
    // PROFILE MENU TOGGLE
    // =======================
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove("open");
            }
        });
    }

    // =======================
    // USER EMAIL
    // =======================
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userEmailEl = document.getElementById("userEmail");
    if (userEmailEl && user?.email) {
        userEmailEl.textContent = user.email;
    }

});
