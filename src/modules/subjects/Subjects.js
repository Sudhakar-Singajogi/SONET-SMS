const Sequelize = require("sequelize");
const path = require("path");

const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("subjects", {
  subjectId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  subjectName: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  schoolId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  type:{
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  passMarks:{
    type: Sequelize.FLOAT(2),
    allowNull: false,
  },
  totalMarks:{
    type: Sequelize.FLOAT(2),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "1",
  },
});
