const express = require("express");
const router = express.Router();
const AuditLog = require("../models/mongo/AuditLog");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/audit/my-audit
router.get("/my-audit", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const logs = await AuditLog.find({ userId }).sort({ timestamp: -1 });
        res.json({ auditLogs: logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ auditLogs: [] });
    }
});

module.exports = router;
