"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable("sections", {
      sectionId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      sectionName: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      schoolId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER(11),
        defaultValue:1,
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
    queryInterface.dropTable("sections");
  },
};
