const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { Consent, User } = require("../models/mysql");
const AuditLog = require("../models/mongo/AuditLog");

// ================= ADMIN STATS =================
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        const totalConsents = await Consent.count();
        const active = await Consent.count({ where: { status: "ACTIVE" } });
        const revoked = await Consent.count({ where: { status: "REVOKED" } });
        const expired = await Consent.count({ where: { status: "EXPIRED" } });

        const totalUsers = await User.count();

        res.json({
            totalConsents,
            active,
            revoked,
            expired,
            totalUsers
        });
    } catch (err) {
        console.error("Admin stats error:", err);
        res.status(500).json({ message: "Failed to load admin stats" });
    }
});

// ================= ADMIN AUDIT LOGS =================
router.get("/audit", authMiddleware, async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(100);

        res.json({ logs });
    } catch (err) {
        console.error("Admin audit error:", err);
        res.status(500).json({ message: "Failed to load audit logs" });
    }
});

// ================= ADMIN – ALL USERS =================
router.get("/users", authMiddleware, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "email", "createdAt"],
            order: [["createdAt", "DESC"]]
        });

        res.json({ users });
    } catch (err) {
        console.error("Admin users error:", err);
        res.status(500).json({ message: "Failed to load users" });
    }
});

// ================= ADMIN – ALL CONSENTS =================
router.get("/consents", authMiddleware, async (req, res) => {
    try {
        const consents = await Consent.findAll({
            order: [["createdAt", "DESC"]]
        });

        res.json({ consents });
    } catch (err) {
        console.error("Admin consents error:", err);
        res.status(500).json({ message: "Failed to load consents" });
    }
});

module.exports = router;
