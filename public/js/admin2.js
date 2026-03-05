/* ================= CONFIG ================= */

const API_BASE = window.CONFIG?.API_BASE || "http://localhost:5000/api";

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", initAdmin);

function initAdmin() {

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
        logout("Login required");
        return;
    }

    if (user.role?.toLowerCase() !== "admin") {
        alert("Access denied. Admin only.");
        window.location.href = "dashboard.html";
        return;
    }

    const emailSpan = document.getElementById("adminEmail");
    if (emailSpan) emailSpan.innerText = user.email;

    loadDashboard();

    initSidebar();
}

/* ================= SIDEBAR ================= */

function initSidebar() {

    const navDashboard = document.getElementById("navDashboard");
    const navUsers = document.getElementById("navUsers");
    const navConsents = document.getElementById("navConsents");
    const navAudit = document.getElementById("navAudit");
    const navLogout = document.getElementById("navLogout");

    const dashboardSection = document.getElementById("dashboardSection");
    const usersSection = document.getElementById("usersSection");
    const consentsSection = document.getElementById("consentsSection");
    const auditSection = document.getElementById("auditSection");

    function hideAll() {
        dashboardSection.style.display = "none";
        usersSection.style.display = "none";
        consentsSection.style.display = "none";
        auditSection.style.display = "none";
    }

    function setActive(link) {
        document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
        link.classList.add("active");
    }

    navDashboard.onclick = (e) => {
        e.preventDefault();
        hideAll();
        dashboardSection.style.display = "block";
        setActive(navDashboard);
        loadDashboard();
    };

    navUsers.onclick = (e) => {
        e.preventDefault();
        hideAll();
        usersSection.style.display = "block";
        setActive(navUsers);
        loadUsers();
    };

    navConsents.onclick = (e) => {
        e.preventDefault();
        hideAll();
        consentsSection.style.display = "block";
        setActive(navConsents);
        loadConsents();
    };

    navAudit.onclick = (e) => {
        e.preventDefault();
        hideAll();
        auditSection.style.display = "block";
        setActive(navAudit);
        loadAuditLogs();
    };

    navLogout.onclick = (e) => {
        e.preventDefault();
        logout("Logged out successfully");
    };

}

/* ================= LOGOUT ================= */

function logout(msg = "Session expired") {
    alert(msg);
    localStorage.clear();
    window.location.href = "index.html";
}

/* ================= API HELPER ================= */

async function apiFetch(url, options = {}) {

    const token = localStorage.getItem("token");

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await res.json();
    } catch { }

    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

/* ================= DASHBOARD ================= */

async function loadDashboard() {

    try {

        const dashboard = await apiFetch(`${API_BASE}/admin2/dashboard`);

        document.getElementById("totalUsers").innerText = dashboard.totalUsers || 0;
        document.getElementById("activeUsers").innerText = dashboard.activeUsers || 0;
        document.getElementById("blockedUsers").innerText = dashboard.blockedUsers || 0;
        document.getElementById("totalConsents").innerText = dashboard.totalConsents || 0;

        loadDashboardUsers();

    } catch (err) {

        console.error(err);
        alert("Dashboard failed: " + err.message);

    }

}

/* ================= DASHBOARD USERS ================= */

async function loadDashboardUsers() {

    try {

        const res = await apiFetch(`${API_BASE}/admin2/users`);
        const users = res.users || [];

        const table = document.getElementById("userTable");

        if (!table) return;

        if (users.length === 0) {
            table.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
            return;
        }

        table.innerHTML = users.map(user => {

            const statusBadge =
                user.status === "BLOCKED"
                    ? `<span class="blocked">BLOCKED</span>`
                    : `<span class="active">ACTIVE</span>`;

            const actionButton =
                user.status === "BLOCKED"
                    ? `<button class="unblockBtn" onclick="unblockUser(${user.id})">Unblock</button>`
                    : `<button class="blockBtn" onclick="blockUser(${user.id})">Block</button>`;

            const consentButton =
                `<button class="consentBtn" onclick="openConsentModal('${user.email}')">Send Consent</button>`;

            return `
            <tr>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${statusBadge}</td>
                <td>${actionButton}</td>
                <td>${consentButton}</td>
            </tr>
            `;

        }).join("");

    } catch (err) {

        console.error("Users load error:", err);
        alert("Failed to load users");

    }
}

/* ================= USERS PAGE ================= */
async function loadUsers() {
    try {
        const data = await apiFetch(`${API_BASE}/admin2/users`);
        const table = document.getElementById("usersTablePage");
        if (!table) return;

        const users = data.users || [];
        if (users.length === 0) {
            table.innerHTML = `<tr><td colspan="4" style="text-align:center;">No users found</td></tr>`;
            return;
        }

        table.innerHTML = users.map(u => {
            const statusBadge = u.status === "BLOCKED"
                ? `<span class="badge blocked-badge">BLOCKED</span>`
                : `<span class="badge active-badge">ACTIVE</span>`;

            const actionBtn = u.status === "BLOCKED"
                ? `<button style="background:green;color:white;padding:5px 10px;border:none;border-radius:4px;cursor:pointer;" onclick="unblockUser(${u.id})">Unblock</button>`
                : `<button style="background:red;color:white;padding:5px 10px;border:none;border-radius:4px;cursor:pointer;" onclick="blockUser(${u.id})">Block</button>`;

            return `
                <tr>
                    <td>${u.email || "-"}</td>
                    <td>${u.role || "-"}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Users Load Error:", err);
        alert("Failed to load users");
    }
}
/* ================= CONSENTS ================= */
async function loadConsents() {
    try {
        // 1️⃣ Fetch all users to map userId -> email
        const usersData = await apiFetch(`${API_BASE}/admin2/users`);
        const users = usersData.users || [];
        const userEmailMap = {};
        users.forEach(u => {
            userEmailMap[u.id] = u.email;
        });

        // 2️⃣ Fetch consents
        const data = await apiFetch(`${API_BASE}/admin2/consents`);
        const table = document.getElementById("consentsTable");
        if (!table) return;

        const consents = data.consents || [];
        if (consents.length === 0) {
            table.innerHTML = `<tr><td colspan="4">No consents found</td></tr>`;
            return;
        }

        // 3️⃣ Build table rows using userEmailMap
        table.innerHTML = consents.map(c => {
            const email = userEmailMap[c.userId] || "Unknown";
            const time = c.createdAt ? new Date(c.createdAt).toLocaleString() : "-";

            return `
                <tr>
                    <td>${email}</td>
                    <td>${c.purpose || "-"}</td>
                    <td>${c.status || "-"}</td>
                    <td>${time}</td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Consent Load Error:", err);
        alert("Failed to load consents");
    }
}
/* ================= AUDIT LOGS ================= */
async function loadAuditLogs() {
    try {
        const data = await apiFetch(`${API_BASE}/admin2/audit`);
        const table = document.getElementById("auditTable");
        if (!table) return;

        const logs = data.logs || [];
        if (logs.length === 0) {
            table.innerHTML = `<tr><td colspan="3" style="text-align:center;">No audit logs found</td></tr>`;
            return;
        }

        table.innerHTML = logs.map(log => {
            // Use any available field for target user
            const targetEmail = log.targetUserEmail || log.userEmail || log.userId || "Unknown";

            // Display createdAt or timestamp
            let time = "-";
            if (log.createdAt) time = new Date(log.createdAt).toLocaleString();
            else if (log.timestamp) time = new Date(log.timestamp).toLocaleString();

            return `
                <tr>
                    <td>${targetEmail}</td>
                    <td>${log.action || "-"}</td>
                    <td>${time}</td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Audit Load Error:", err);
        alert("Failed to load audit logs");
    }
}
/* ================= BLOCK USER ================= */

async function blockUser(id) {

    try {

        const data = await apiFetch(`${API_BASE}/admin2/block/${id}`, {
            method: "PUT"
        });

        alert(data.message || "User blocked successfully");

        loadDashboard();

    } catch (err) {

        alert("Block failed: " + err.message);

    }

}

/* ================= UNBLOCK USER ================= */

async function unblockUser(id) {

    try {

        const data = await apiFetch(`${API_BASE}/admin2/unblock/${id}`, {
            method: "PUT"
        });

        alert(data.message || "User unblocked successfully");

        loadDashboard();

    } catch (err) {

        alert("Unblock failed: " + err.message);

    }

}
/* ================= SEND CONSENT ================= */

function openConsentModal(email) {

    const modal = document.getElementById("consentModal");

    document.getElementById("consentUserEmail").value = email;

    modal.style.display = "block";
}

function closeConsentModal() {

    document.getElementById("consentModal").style.display = "none";
}

async function sendConsent() {
    const userEmail = document.getElementById("consentUserEmail").value;
    const purpose = document.getElementById("consentPurpose").value;
    const validTill = document.getElementById("consentValidTill").value;

    if (!userEmail || !purpose || !validTill) {
        alert("Please fill all fields!");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin2/send-consent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({ userEmail, purpose, validTill }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to send consent");

        alert(data.message);
        closeConsentModal();
        loadDashboard();

    } catch (err) {
        console.error("Send Consent Error:", err);
        alert(err.message);
    }
}