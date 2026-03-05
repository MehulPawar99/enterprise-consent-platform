const { Consent } = require("../models/mysql");
const AuditLog = require("../models/mongo/AuditLog");
const { Op } = require("sequelize");

async function expireConsents() {
    try {
        const now = new Date();

        // 1️⃣ Find expired but still granted consents
        const expiredConsents = await Consent.findAll({
            where: {
                validTill: { [Op.lt]: now },
                isGranted: true
            }
        });

        // 2️⃣ Revoke + audit each consent
        for (const consent of expiredConsents) {
            await consent.update({
                isGranted: false,
                status: "EXPIRED"
            });

            await AuditLog.create({
                userId: consent.userId,
                action: "CONSENT_AUTO_EXPIRED",
                purpose: consent.purpose,
                timestamp: new Date()
            });
        }

        if (expiredConsents.length > 0) {
            console.log(`[AUTO-EXPIRY] ${expiredConsents.length} consent(s) expired`);
        }

    } catch (err) {
        console.error("[CONSENT EXPIRY JOB ERROR]", err);
    }
}

module.exports = expireConsents;
