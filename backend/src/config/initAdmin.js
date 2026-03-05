const bcrypt = require("bcrypt");
const { sequelize } = require("./mysql");
const User = require("../models/mysql/User"); // your User model

const createDefaultAdmin = async () => {
    try {
        const adminEmail = "admin@example.com"; // default admin email
        const adminPassword = "admin123"; // default admin password

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log("Admin already exists, skipping creation.");
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        await User.create({
            name: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
        });

        console.log("Default admin user created successfully!");
    } catch (err) {
        console.error("Failed to create default admin:", err);
    }
};

module.exports = { createDefaultAdmin };