const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("permissions", {
  // var perms = sequelize.define("permissions", {
  permissionId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  schoolId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  moduleId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  read: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  write: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  delete: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
});

// perms.belongsTo(featuresModel, { through: 'moduleId', foreignKey: 'moduleId' });

// module.exports.perms;
