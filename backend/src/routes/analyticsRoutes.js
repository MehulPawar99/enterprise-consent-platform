const express = require("express");
const router = express.Router();
const { Consent } = require("../models/mysql");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/analytics/summary
router.get("/summary", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const consents = await Consent.findAll({ where: { userId } });

        const active = consents.filter(c => c.status === "ACTIVE").length;
        const revoked = consents.filter(c => c.status === "REVOKED").length;
        const expired = consents.filter(c => c.status === "EXPIRED").length;

        res.json({ active, revoked, expired });
    } catch (err) {
        console.error(err);
        res.status(500).json({ active: 0, revoked: 0, expired: 0 });
    }
});

// GET /api/analytics/purpose
router.get("/purpose", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const consents = await Consent.findAll({ where: { userId } });

        const purposeMap = {};
        consents.forEach(c => {
            if (!purposeMap[c.purpose]) purposeMap[c.purpose] = 0;
            purposeMap[c.purpose]++;
        });

        const result = Object.entries(purposeMap).map(([purpose, count]) => ({ purpose, count }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.json([]);
    }
});

module.exports = router;
