const { Consent } = require("../models/mysql");
const AuditLog = require("../models/mongo/AuditLog"); // MongoDB audit model

// Create / Grant Consent
exports.grantConsent = async (req, res) => {
    try {
        const { purpose, validTill } = req.body;
        const userId = req.user.id; // from auth middleware

        if (!purpose || !validTill) {
            return res.status(400).json({ message: "Purpose and validTill are required" });
        }

        const consent = await Consent.create({
            userId,
            purpose,
            validTill,
            isGranted: true,
        });

        // Log to MongoDB
        await AuditLog.create({
            userId,
            action: "GRANT_CONSENT",
            purpose,
            timestamp: new Date(),
        });

        res.status(201).json({ message: "Consent granted", consent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Revoke Consent
exports.revokeConsent = async (req, res) => {
    try {
        const { consentId } = req.params;
        const userId = req.user.id;

        const consent = await Consent.findOne({ where: { id: consentId, userId } });
        if (!consent) return res.status(404).json({ message: "Consent not found" });

        consent.isGranted = false;
        await consent.save();

        // Audit log
        await AuditLog.create({
            userId,
            action: "REVOKE_CONSENT",
            purpose: consent.purpose,
            timestamp: new Date(),
        });

        res.status(200).json({ message: "Consent revoked", consent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update Consent
exports.updateConsent = async (req, res) => {
    try {
        const { consentId } = req.params;
        const { purpose, validTill } = req.body;
        const userId = req.user.id;

        const consent = await Consent.findOne({ where: { id: consentId, userId } });
        if (!consent) return res.status(404).json({ message: "Consent not found" });

        if (purpose) consent.purpose = purpose;
        if (validTill) consent.validTill = validTill;

        await consent.save();

        // Audit log
        await AuditLog.create({
            userId,
            action: "UPDATE_CONSENT",
            purpose: consent.purpose,
            timestamp: new Date(),
        });

        res.status(200).json({ message: "Consent updated", consent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all consents for current user
exports.getUserConsents = async (req, res) => {
    try {
        const userId = req.user.id;

        const consents = await Consent.findAll({ where: { userId } });

        res.status(200).json({ consents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Get all consents
exports.getAllConsents = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

        const consents = await Consent.findAll();

        res.status(200).json({ consents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
