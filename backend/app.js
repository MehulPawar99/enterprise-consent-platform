/**
 * app.js
 * Main Express application configuration
 */

require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectMongo = require("./src/config/mongo");
const { connectMySQL, syncMySQLModels } = require("./src/config/mysql");
const expireConsents = require("./src/jobs/consentExpiryJob");

const app = express(); // <-- must be BEFORE any app.use()

/* =========================
   Global Middlewares
========================= */
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../public")));

/* =========================
   Database Connections
========================= */
(async () => {
    try {
        await connectMongo();
        await connectMySQL();
        await syncMySQLModels();
        console.log("All databases connected successfully");
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
})();

/* =========================
   Background Jobs
========================= */
// Runs once every 24 hours
setInterval(expireConsents, 1000 * 60 * 60 * 24);

/* =========================
   API Routes
========================= */
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/consent", require("./src/routes/consentRoutes"));
app.use("/api/audit", require("./src/routes/auditRoutes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes")); // <-- Add this if analytics routes exist
app.use("/api/admin2", require("./src/routes/admin2Routes"));
/* =========================
   Health Check (IMPORTANT)
========================= */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date(),
    });
});

/* =========================
   404 Handler
========================= */
app.use((req, res) => {
    res.status(404).json({
        message: "API endpoint not found",
    });
});

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        message: "Internal server error",
    });
});

module.exports = app;
