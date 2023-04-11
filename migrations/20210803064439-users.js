"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable("users", {
      userId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      userName: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      roleId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        default: 1,
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
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("users");
  },
};
