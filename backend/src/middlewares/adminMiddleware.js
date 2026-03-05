module.exports = function adminMiddleware(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access only"
            });
        }

        next();
    } catch (err) {
        console.error("Admin middleware error:", err);
        res.status(500).json({
            message: "Admin middleware failed"
        });
    }
};