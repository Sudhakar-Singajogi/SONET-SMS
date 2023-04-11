"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable("assigned_subjects_classes", {
      assignedId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      subjectId: {
        type: Sequelize.STRING(300),
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
    queryInterface.dropTable("assigned_subjects_class");
  },
};
