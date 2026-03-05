const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.MYSQL_DB,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: "mysql",
        logging: false,
    }
);

const connectMySQL = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL connected");
    } catch (err) {
        console.error("MySQL connection failed:", err);
        process.exit(1);
    }
};

const syncMySQLModels = async () => {
    try {
        const User = require("../models/mysql/User");
        const Consent = require("../models/mysql/Consent");

        await User.sync({ alter: true });
        await Consent.sync({ alter: true });

        console.log("MySQL models synced");

        const { createDefaultAdmin } = require("./initAdmin");
        await createDefaultAdmin();
    } catch (err) {
        console.error("Model sync failed:", err);
        process.exit(1);
    }
};

module.exports = { sequelize, connectMySQL, syncMySQLModels };