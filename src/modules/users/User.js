const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("users", {
  userId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  userName: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(30),
    allowNull: false,
    unique: true,
  },
  roleId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  schoolId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "1",
  },
});
