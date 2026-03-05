const API_BASE = window.CONFIG.API_BASE;
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login again");
  window.location.href = "index.html";
}

async function loadConsents() {
  try {
    const res = await fetch(`${API_BASE}/consent/my-consents`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();
    const consents = result.consents || [];

    const tbody = document.getElementById("consentTable");
    tbody.innerHTML = "";

    if (consents.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center">No consents found</td>
        </tr>
      `;
      return;
    }

    consents.forEach(c => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${c.purpose}</td>
        <td><span class="pill ${c.status.toLowerCase()}">${c.status}</span></td>
        <td>${new Date(c.validTill).toLocaleDateString()}</td>
        <td>
          <button class="primary-btn" onclick="toggleConsent('${c.id}')">
            ${c.status === "ACTIVE" ? "Revoke" : "Grant"}
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load consents");
  }
}

async function toggleConsent(id) {
  try {
    const res = await fetch(`${API_BASE}/consent/update/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to update");

    loadConsents();

  } catch (err) {
    alert("Action failed");
  }
}

loadConsents();
