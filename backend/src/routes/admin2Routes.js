const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const admin = require("../controllers/admin2Controller");
const { sendConsent } = admin;

// Dashboard
router.get("/dashboard", authMiddleware, adminMiddleware, admin.getDashboard);

// Users
router.get("/users", authMiddleware, adminMiddleware, admin.getAllUsers);
router.put("/block/:id", authMiddleware, adminMiddleware, admin.blockUser);
router.put("/unblock/:id", authMiddleware, adminMiddleware, admin.unblockUser);

// Consents
router.get("/consents", authMiddleware, adminMiddleware, admin.getConsents);

// Audit
router.get("/audit", authMiddleware, adminMiddleware, admin.getAuditLogs);

router.post("/send-consent", authMiddleware, adminMiddleware, sendConsent);

module.exports = router;