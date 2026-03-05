const { User, Consent } = require("../models/mysql");
const AuditLog = require("../models/mongo/AuditLog");

/* ================= DASHBOARD ================= */
exports.getDashboard = async (req, res) => {
    try {

        const totalUsers = await User.count();

        const activeUsers = await User.count({
            where: { status: "ACTIVE" }
        });

        const blockedUsers = await User.count({
            where: { status: "BLOCKED" }
        });

        const totalConsents = await Consent.count();

        res.json({
            totalUsers,
            activeUsers,
            blockedUsers,
            totalConsents
        });

    } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        res.status(500).json({
            message: "Dashboard failed",
            error: err.message
        });
    }
};

/* ================= GET USERS ================= */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "email", "role", "status", "createdAt"],
            order: [["createdAt", "DESC"]]
        });

        res.json({ users });
    } catch (err) {
        res.status(500).json({ message: "Users fetch failed" });
    }
};

/* ================= BLOCK USER ================= */
exports.blockUser = async (req, res) => {
    try {
        const { id } = req.params;

        await User.update(
            { status: "BLOCKED" },
            { where: { id } }
        );

        await AuditLog.create({
            action: "USER_BLOCKED",
            adminId: req.user.id,
            targetUserId: id,
            timestamp: new Date()
        });

        res.json({ message: "User blocked successfully" });
    } catch (err) {
        res.status(500).json({ message: "Block failed" });
    }
};

/* ================= UNBLOCK USER ================= */
exports.unblockUser = async (req, res) => {
    try {
        const { id } = req.params;

        await User.update(
            { status: "ACTIVE" },
            { where: { id } }
        );

        await AuditLog.create({
            action: "USER_UNBLOCKED",
            adminId: req.user.id,
            targetUserId: id,
            timestamp: new Date()
        });

        res.json({ message: "User unblocked successfully" });
    } catch (err) {
        res.status(500).json({ message: "Unblock failed" });
    }
};

/* ================= ALL CONSENTS ================= */
exports.getConsents = async (req, res) => {
    try {
        const consents = await Consent.findAll({
            order: [["createdAt", "DESC"]]
        });

        res.json({ consents });
    } catch (err) {
        res.status(500).json({ message: "Consent fetch failed" });
    }
};

/* ================= AUDIT LOGS ================= */
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(100);

        res.json({ logs });
    } catch (err) {
        res.status(500).json({ message: "Audit fetch failed" });
    }
};

exports.sendConsent = async (req, res) => {
    try {
        const { userEmail, purpose, validTill } = req.body;

        // Basic validation
        if (!userEmail || !purpose || !validTill) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create consent
        const consent = await Consent.create({
            userId: user.id,
            purpose: purpose.trim(),
            isGranted: false,
            validTill: validTill,
            status: "PENDING" // ✅ Always a valid ENUM value
        });

        return res.status(201).json({
            message: "Consent request sent successfully",
            consent
        });

    } catch (err) {
        console.error("Send Consent Error:", err);

        // Check if it's a Sequelize ENUM error
        if (err.name === "SequelizeDatabaseError" || err.name === "SequelizeValidationError") {
            return res.status(400).json({ message: "Invalid data for consent. Please check values." });
        }

        return res.status(500).json({ message: "Failed to send consent", error: err.message });
    }
};