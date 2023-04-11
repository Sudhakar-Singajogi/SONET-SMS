const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("assigned_subjects_classes", {
  assignedId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  subjectId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  classId: {
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
