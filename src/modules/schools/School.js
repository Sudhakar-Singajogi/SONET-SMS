const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("schools", {
  schoolId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  schoolName: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  identity: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(30),
    allowNull: false,
    unique: true,
  },
  primaryContactPerson: {
    type: Sequelize.STRING(300),
    allowNull: false,
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
