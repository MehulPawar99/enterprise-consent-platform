// dashboard.js
const API_BASE = window.CONFIG.API_BASE;
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

let chartInstance = null;

async function loadDashboard() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/consent/my-consents`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Unauthorized or API error");

        const result = await res.json();
        const consents = result.consents || [];

        let active = 0;
        let revoked = 0;
        let expiringSoon = 0;

        const tbody = document.getElementById("recentConsents");
        tbody.innerHTML = "";

        const now = new Date();
        now.setHours(0, 0, 0, 0); // normalize to midnight

        const soonThreshold = new Date();
        soonThreshold.setHours(0, 0, 0, 0);
        soonThreshold.setDate(now.getDate() + 7);

        if (consents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3">
                        <div class="empty-state">
                            <h3>No consents found</h3>
                            <p>Create your first consent.</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        consents.forEach(c => {
            const validTillDate = new Date(c.validTill);
            if (isNaN(validTillDate)) return; // skip invalid dates

            const status = (c.status || "").toUpperCase();

            if (status === "ACTIVE") active++;
            if (status === "REVOKED") revoked++;

            if (
                status === "ACTIVE" &&
                validTillDate >= now &&
                validTillDate <= soonThreshold
            ) {
                expiringSoon++;
            }
        });

        // Render only recent 5 in table
        consents.slice(0, 5).forEach(c => {
            const validTillDate = new Date(c.validTill);
            tbody.innerHTML += `
                <tr>
                    <td>${c.purpose || "-"}</td>
                    <td><span class="pill ${c.status.toLowerCase()}">${c.status}</span></td>
                    <td>${!isNaN(validTillDate) ? validTillDate.toLocaleDateString() : "-"}</td>
                </tr>
            `;
        });

        document.getElementById("statsActive").innerText = active;
        document.getElementById("statsRevoked").innerText = revoked;
        document.getElementById("statsExpiring").innerText = expiringSoon;

        renderChart(active, revoked, expiringSoon);

    } catch (err) {
        console.error("Dashboard load failed:", err);
        alert("Failed to load dashboard data. Check backend or token.");
    }
}
function renderChart(active, revoked, expiringSoon) {
    const ctx = document.getElementById("consentChart");
    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy(); // 🔥 IMPORTANT FIX
    }

    chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Active", "Expiring Soon", "Revoked"],
            datasets: [
                {
                    data: [active, expiringSoon, revoked],
                    backgroundColor: ["#22c55e", "#facc15", "#ef4444"], // green, yellow, red
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

loadDashboard();
