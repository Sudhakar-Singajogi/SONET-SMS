const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("schools", {
  id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  schoolName: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  schoolIdentity: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  primaryEmail: {
    type: Sequelize.STRING(30),
    allowNull: false,
    unique: true,
  },
  contactNumber: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "1",
  },
});
