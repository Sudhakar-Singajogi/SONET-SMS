const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));
const permsModel = require(path.resolve("src/modules/permissions/permissions"));
// var rolePerms = sequelize.define("assigned_permissionto_roles", {
module.exports = sequelize.define("assigned_permissionto_roles", {
  assignedId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  roleId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  permissionId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
});
