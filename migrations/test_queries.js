"use strict";
const sequelize = require("../src/dbconn/connection");

const insert_dummy_user =
  "INSERT INTO `roles` (`roleId`, `roleName`, `status`, `createdAt`, `updatedAt`) VALUES (NULL, 'Test', '1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await sequelize.query(insert_dummy_user, {
      type: sequelize.QueryTypes.INSERT,
    });
  },
};
