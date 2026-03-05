const AuditLog = require("../models/mongo/AuditLog");

// Get audit logs for logged-in user
exports.getMyAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({ userId: req.user.id })
            .sort({ timestamp: -1 });

        res.json({ auditLogs: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
};

// Admin: get all audit logs
exports.getAllAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(500);

        res.json({ auditLogs: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch audit logs" });
    }
};
