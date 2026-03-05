const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/mysql");

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "ACTIVE"
    }
});

module.exports = User;
