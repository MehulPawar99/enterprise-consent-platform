const { Consent } = require("../models/mysql");

// USER analytics
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const consents = await Consent.findAll({ where: { userId } });

        const analytics = {
            active: consents.filter(c => c.isGranted).length,
            revoked: consents.filter(c => !c.isGranted).length,
            expired: consents.filter(c => new Date(c.validTill) < new Date()).length
        };

        res.json(analytics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Analytics error" });
    }
};

// PURPOSE distribution
exports.getPurposeAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const consents = await Consent.findAll({ where: { userId } });

        const map = {};
        consents.forEach(c => {
            map[c.purpose] = (map[c.purpose] || 0) + 1;
        });

        const result = Object.entries(map).map(([purpose, count]) => ({
            purpose,
            count
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Purpose analytics error" });
    }
};
