"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable("schools", {
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
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      primaryContactPerson: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      contactNumber: {
        type: Sequelize.STRING(300),
        allowNull: true,
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
    queryInterface.dropTable("schools");
  },
};
