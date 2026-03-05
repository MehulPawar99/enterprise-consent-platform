const { Consent } = require("../models/mysql");

// Middleware to check if user has valid consent for a purpose
const consentMiddleware = (purpose) => async (req, res, next) => {
    try {
        const userId = req.user.id;

        const consent = await Consent.findOne({
            where: {
                userId,
                purpose,
                isGranted: true,
                validTill: { [require("sequelize").Op.gt]: new Date() },
            },
        });

        if (!consent) {
            return res.status(403).json({ message: "No valid consent for this action" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { consentMiddleware };
