const API_BASE = window.CONFIG.API_BASE;
const token = localStorage.getItem("token");

if (!token) {
    alert("Unauthorized. Please login again.");
    window.location.href = "index.html";
}

async function loadAudit() {
    try {
        const res = await fetch(`${API_BASE}/audit/my-audit`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Failed to load audit history");
        }

        const data = await res.json();
        const logs = data.auditLogs || [];

        const list = document.getElementById("auditList");
        list.innerHTML = "";

        if (!logs.length) {
            list.innerHTML = `
                <li class="empty-state">
                    <h3>No audit history yet</h3>
                    <p>Your consent actions will appear here.</p>
                </li>
            `;
            return;
        }

        logs.forEach(log => {
            const li = document.createElement("li");
            li.className = "timeline-item";
            li.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h4>${log.action}</h4>
                    <p>${log.purpose || "—"}</p>
                    <span>${new Date(log.timestamp).toLocaleString()}</span>
                </div>
            `;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Audit load error:", err);
        alert("Failed to load audit history. Check backend or token.");
    }
}

loadAudit();
