const { sequelize } = require("../../config/mysql");
const { DataTypes } = require("sequelize");

const Consent = sequelize.define("Consent", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    purpose: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isGranted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    validTill: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(
            "ACTIVE",
            "REVOKED",
            "EXPIRED",
            "PENDING"
        ),
        allowNull: false,
        defaultValue: "PENDING"
    }

});

module.exports = Consent;
