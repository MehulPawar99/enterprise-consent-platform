const API_BASE = window.CONFIG.API_BASE;

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginTab.onclick = () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
};

signupTab.onclick = () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
};


/* =====================================================
   LOGIN
===================================================== */
loginForm.onsubmit = async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    const btn = loginForm.querySelector(".primary-btn");
    const spinner = btn.querySelector(".spinner");
    const text = btn.querySelector(".btn-text");

    spinner.classList.remove("hidden");
    text.textContent = "Logging in...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Login failed");
        }

        console.log("Logged in user:", data.user); // ✅ Correct place

        // Save token + user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        loginMessage.className = "message success";
        loginMessage.textContent = "Login successful. Redirecting...";

        // ✅ ROLE-BASED REDIRECT (case-safe)
        setTimeout(() => {

            const role = data.user.role?.toLowerCase();

            if (role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }

        }, 800);

    } catch (err) {
        loginMessage.className = "message error";
        loginMessage.textContent = err.message;
    } finally {
        spinner.classList.add("hidden");
        text.textContent = "Login";
        btn.disabled = false;
    }
};


/* =====================================================
   SIGNUP
===================================================== */
signupForm.onsubmit = async (e) => {
    e.preventDefault();

    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();

    const btn = signupForm.querySelector(".primary-btn");
    const spinner = btn.querySelector(".spinner");
    const text = btn.querySelector(".btn-text");

    spinner.classList.remove("hidden");
    text.textContent = "Creating...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Signup failed");
        }

        signupMessage.className = "message success";
        signupMessage.textContent = "Account created. You can login now.";

        signupForm.reset();
        loginTab.click();

    } catch (err) {
        signupMessage.className = "message error";
        signupMessage.textContent = err.message;
    } finally {
        spinner.classList.add("hidden");
        text.textContent = "Create Account";
        btn.disabled = false;
    }
};