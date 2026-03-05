const Consent = require("./Consent");
const User = require("./User");

const syncMySQLModels = async () => {
    try {
        await Consent.sync({ alter: true });
        await User.sync({ alter: true });
        console.log("MySQL models synced");
    } catch (error) {
        console.error("Model sync failed:", error);
        process.exit(1);
    }
};

module.exports = {
    Consent,
    User,
    syncMySQLModels,
};
