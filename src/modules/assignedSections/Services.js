const path = require("path");
const Utils = require(path.resolve("src/config/utils"));
/*
const clsModel = require("../classes/classes");
const sectionsModel = require("../sections/Sections");
const schoolModel = require("../schools/School");
const assignedSecModel = require("./AssignedSections");

const bLogic = require("../../config/businessLogic");
*/


const clsModel = require(path.resolve("src/modules/classes/classes"));
const sectionsModel = require(path.resolve("src/modules/sections/Sections"));
const schoolModel = require(path.resolve("src/modules/schools/School"));
const assignedSecModel = require(path.resolve("src/modules/assignedSections/AssignedSections"));
const bLogic = require(path.resolve("src/config/businessLogic"));


clsModel.belongsTo(schoolModel, {
  foreignKey: "schoolId",
});

sectionsModel.belongsTo(schoolModel, {
  foreignKey: "schoolId",
});

assignedSecModel.belongsTo(schoolModel, {
  foreignKey: "schoolId",
});

assignedSecModel.belongsTo(clsModel, {
  foreignKey: "classId",
});

assignedSecModel.belongsTo(sectionsModel, {
  foreignKey: "sectionId",
});

const SectionAssoc = {
  model: sectionsModel,
  attributes: {
    exclude: ["schoolId", "classId", "status", "createdAt", "updatedAt"],
  },
};

const SchoolAssoc = {
  model: schoolModel,
  attributes: {
    exclude: [
      "schoolId",
      "identity",
      "email",
      "primaryEmail",
      "contactNumber",
      "primaryContactPerson",
      "status",
      "createdAt",
      "updatedAt",
    ],
  },
};

const classAssoc = {
  model: clsModel,
  attributes: {
    exclude: ["classId", "schoolId", "status", "createdAt", "updatedAt"],
  },
};

var self = (module.exports = {
    getAssignedSections: async (cond, order='asc') => { 
      console.log('order is:', order)

    try {
      const sectionsAssigned = await assignedSecModel.findAll({
        where: cond,
        include: [SectionAssoc, SchoolAssoc, classAssoc],
        attributes: {
          exclude: ["status", "createdAt", "updatedAt"],
        },
      });
      // return sectionsAssigned;

      if (sectionsAssigned.length > 0) {
        const respObj = await bLogic.prepareAssignedsectionsByclass(
          sectionsAssigned, cond, order
        );
        return {
          success: true,
          message: "Success",
          resultSet: respObj,
        };
      } else {
        return {
          success: true,
          message: "No records found",
          resultSet: [],
        };
      }
    } catch (err) {
      return await Utils.catchError("class creation", err);
    }
  },
  assignSections: async (reqBody, return_msg_obj = false) => {
    var schoolId = reqBody.schoolId;
    var classId = reqBody.classId;

    reqBody.clsModel = clsModel;
    reqBody.sectionsModel = sectionsModel;
    reqBody.assignedSecModel = assignedSecModel;
    reqBody.req = "assign";
    var resp = await bLogic.validateAssigned_UnassignedSections(reqBody);

    var assignSectionsToClass = resp.assignSectionsToClass;

    if (resp.errors.length > 0) {
      return await Utils.returnResult("Assign sections to a class", {
        ValidationErrors: resp.errors,
      });
    }

    //bulk insert mean assign sections to a class

    const paramObj = {
      model: assignedSecModel,
      data: assignSectionsToClass,
      insertUpdate: "insert",
      updateOnDuplicateFields: [],
      fetchRowsCond: {
        schoolId,
        classId,
      },
      offset: 0,
      limit: 100,
      msg: "Assign sections to a class",
      excludeFields: [
        "sectionId",
        "classId",
        "schoolId",
        "status",
        "createdAt",
        "updatedAt",
      ],
      feature: "Assign sections",
      includes: [SchoolAssoc, SectionAssoc],
      orderBy: [],
    };

    // bulk update the sections
    const assignSections = await Utils.bulkInsertUpdate(paramObj);

    if (assignSections) {
      if(return_msg_obj) {
        return {"success": true};
      }
      var assignedssections = await self.getAssignedSections({
        schoolId,
        classId,
      });

      var totalRows = assignedssections.resultSet.totalRows;
      delete assignedssections.resultSet.totalRows;
      const resultSet = await Utils.returnResult(
        "assigned sections",
        assignedssections.resultSet,
        null,
        assignedssections.resultSet.length
      );
      resultSet.totalRows = totalRows;
      return resultSet;
    } else {
      await Utils.returnResult("Assign sections to a class", [], false);
    }
  },
  unassignSections: async (reqBody) => {
    var schoolId = reqBody.schoolId;
    var classId = reqBody.classId;

    reqBody.clsModel = clsModel;
    reqBody.sectionsModel = sectionsModel;
    reqBody.assignedSecModel = assignedSecModel;
    reqBody.req = "unassign";
    var resp = await bLogic.validateAssigned_UnassignedSections(reqBody);
    var unAssignSections = resp.assignSectionsToClass;

    if (resp.errors.length > 0) {
      return await Utils.returnResult("UnAssign sections of a class", {
        ValidationErrors: resp.errors,
      });
    }

    for (i = 0; i < unAssignSections.length; i++) {
      var assignedSection = unAssignSections[i];
      console.log("1");
      await assignedSecModel.destroy({
        where: assignedSection,
      });
    }

    var assignedssections = await self.getAssignedSections({
      schoolId,
      classId,
    });

    var totalRows = assignedssections.resultSet.totalRows;
    delete assignedssections.resultSet.totalRows;
    const resultSet = await Utils.returnResult(
      "assigned sections",
      assignedssections.resultSet,
      null,
      assignedssections.resultSet.length
    );
    resultSet.totalRows = totalRows;

    return resultSet;
  },
});
