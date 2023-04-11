const path = require("path");
const Utils = require(path.resolve("src/config/utils"));

// const subModel = require("./Subjects");
// const clsModel = require("../classes/classes");
// const schlModel = require("../schools/School");
// const blogic = require("../../config/businessLogic");
// const assignedSubjectsModel = require("../assignedsubjects/AssignedSubjects");

const subModel = require(path.resolve("src/modules/subjects/Subjects"));
const clsModel = require(path.resolve("src/modules/classes/classes"));
const schlModel = require(path.resolve("src/modules/schools/School"));
const blogic = require(path.resolve("src/config/businessLogic"));
const assignedSubjectsModel = require(path.resolve("src/modules/assignedsubjects/AssignedSubjects"));

subModel.belongsTo(schlModel, {
  thorugh: "schoolId",
  foreignKey: "schoolId",
});

const schoolAssoc = {
  model: schlModel,
  attributes: {
    exclude: [
      "schoolId",
      "email",
      "primaryContactPerson",
      "contactNumber",
      "status",
      "createdAt",
      "updatedAt",
    ],
  },
};

module.exports = {
  updateSubjects: async (reqObj) => {
    const schoolId = reqObj.user.schoolId;

    //check whether the subject exists with the school or not
    var resp = {};
    reqObj.subModel = subModel;

    resp = await blogic.validateSubjectsOfASchool(reqObj);

    if (resp.errors.length > 0) {
      return await Utils.returnResult("Subjects update", {
        ValidationErrors: resp.errors,
      });
    }
    var data = resp.dataToUpdate;
    var model = subModel;
    var insertUpdate = "update";
    var excludeFields = await Utils.getTableColumns(subModel, "exclude", false);
    var updateOnDuplicateFields = await Utils.getTableColumns(
      subModel,
      "include",
      true
    );
    var fetchRowsCond = { schoolId };
    var offset = 0;
    var limit = 100;
    var msg = "Update subjects";
    var excludeFields = excludeFields;
    var feature = "UpdateSubjects";
    var includes = [schoolAssoc];
    var orderBy = ["updatedAt", "desc"];

    const paramObj = {
      model,
      data,
      insertUpdate,
      updateOnDuplicateFields,
      fetchRowsCond,
      offset,
      limit,
      msg,
      excludeFields,
      feature,
      includes,
      orderBy,
    };

    const updateSubjectsResp = await Utils.bulkInsertUpdate(paramObj);

    return updateSubjectsResp
      ? await Utils.returnResult(
          "Update Subjects",
          updateSubjectsResp.resultSet,
          null,
          updateSubjectsResp.resultSet.length
        )
      : await Utils.returnResult("Update Subjects", [], false);
  },
  deleteSubject: async (reqOb) => {
    var subjectId = reqOb.subjectId;
    var schoolId = reqOb.schoolId;
    var errors = [];

    var subExists = await Utils.checkRowExists(
      { subjectId, schoolId },
      subModel,
      "check subject exists or not"
    );

    if (subExists == 0) {
      return await Utils.returnResult("Subjects update", {
        ValidationErrors: "Cannot find subject in your school",
      });
    } else {
      //delete the subject
      var remainingSubjects = await subModel
        .destroy({
          where: {
            subjectId,
            schoolId,
          },
        })
        .then(async () => {
          var paramobj = {
            model: subModel,
            fetchRowConds: { schoolId },
            excludeFields: await Utils.getTableColumns(
              subModel,
              "exclude",
              false
            ),
            orderBy: ["subjectId", "DESC"],
          };

          var subjects = await Utils.fetchRows(paramobj);

          if (subjects) {
            await assignedSubjectsModel
              .destroy({
                where: {
                  subjectId,
                  schoolId,
                },
              })
              .then(async () => {
                await Utils.logToWinston("Successfully unassigned the subject");
              })
              .catch(async (err) => {
                await Utils.logToWinston(
                  "Failed in unassigning of the subject due to:",
                  err
                );
              });
          }
          return subjects
            ? await Utils.returnResult(
                "Delete Subjects",
                subjects.resultSet,
                null,
                subjects.resultSet.length
              )
            : await Utils.returnResult("Delete Subjects", [], false);
        });

      return remainingSubjects ? remainingSubjects : [];
    }
  },
};
