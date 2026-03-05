const { Consent, User } = require("../models/mysql");
const AuditLog = require("../models/mongo/AuditLog");

// Dashboard summary
exports.getAdminStats = async (req, res) => {
    try {
        const totalConsents = await Consent.count();
        const active = await Consent.count({ where: { isGranted: true } });
        const revoked = await Consent.count({ where: { isGranted: false } });

        res.json({ totalConsents, active, revoked });
    } catch (err) {
        res.status(500).json({ message: "Stats error" });
    }
};

// All consents (with users)
exports.getAllConsents = async (req, res) => {
    try {
        const consents = await Consent.findAll({
            include: [{ model: User, attributes: ["email", "role"] }]
        });
        res.json({ consents });
    } catch (err) {
        res.status(500).json({ message: "Consent fetch failed" });
    }
};

// All audit logs
exports.getAllAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 });
        res.json({ auditLogs: logs });
    } catch (err) {
        res.status(500).json({ message: "Audit fetch failed" });
    }
};
