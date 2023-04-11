const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("students", {
  studentId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  studentFirstName: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  studentLastName: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  classId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  sectionId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  academicYear: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  contactNumber: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  profilePic: {
    type: Sequelize.STRING(300),
    allowNull: true,
  },
  DOB: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  bloodGroup: {
    type: Sequelize.STRING(300),
    allowNull: true,
  },
  rollNumber: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "1",
  },
});
