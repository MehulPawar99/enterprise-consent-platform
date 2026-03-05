const express = require("express");
const router = express.Router();
const { Consent } = require("../models/mysql");
const authMiddleware = require("../middlewares/authMiddleware");
const AuditLog = require("../models/mongo/AuditLog");

// CREATE consent
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { purpose, validTill } = req.body;

        const consent = await Consent.create({
            userId: req.user.id,
            purpose,
            validTill,
            isGranted: true,
            status: "ACTIVE"
        });

        await AuditLog.create({
            userId: req.user.id,
            action: "CONSENT_CREATED",
            purpose,
            timestamp: new Date()
        });

        res.status(201).json(consent);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create consent" });
    }
});


// GET my consents
router.get("/my-consents", authMiddleware, async (req, res) => {
    const consents = await Consent.findAll({
        where: { userId: req.user.id }
    });
    res.json({ consents });
});


// UPDATE consent (grant/revoke)
router.put("/update/:id", authMiddleware, async (req, res) => {
    const consent = await Consent.findByPk(req.params.id);

    if (!consent) return res.status(404).json({ message: "Not found" });

    consent.isGranted = !consent.isGranted;
    consent.status = consent.isGranted ? "ACTIVE" : "REVOKED";

    await consent.save();

    await AuditLog.create({
        userId: req.user.id,
        action: consent.isGranted ? "CONSENT_GRANTED" : "CONSENT_REVOKED",
        purpose: consent.purpose,
        timestamp: new Date()
    });

    res.json(consent);
});

module.exports = router;
