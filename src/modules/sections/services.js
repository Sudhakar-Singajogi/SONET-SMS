const path = require("path");
const Utils = require(path.resolve("src/config/utils"));
const { empty } = require("joi");
const Sequelize = require("sequelize");
const op = Sequelize.Op;
// let secModel = require("./Sections");
// const schoolModel = require("../schools/School");
let secModel = require(path.resolve("src/modules/sections/Sections"));
const schoolModel = require(path.resolve("src/modules/schools/School"));

secModel.belongsTo(schoolModel, {
  thorugh: "schoolId",
  foreignKey: "schoolId",
});

const schoolAssoc = {
  model: schoolModel,
  attributes: {
    exclude: [
      "identity",
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
  createNewSection: async (reqObj) => {
    var errors = [];

    try {
      const sections = reqObj.sections;
      const insertData = [];
      // var validationErrors = reqObj.sections.forEach(async(sectionObj) => {
      for (i = 0; i < sections.length; i++) {
        var sectionName = sections[i].sectionName;
        var totalSections = await Utils.checkRowExists(
          {
            schoolId: reqObj.schoolId,
            sectionName: sectionName,
            status: 1,
          },
          secModel,
          "check a section exists in this school"
        );

        if (totalSections > 0) {
          errors.push({
            sectionName: `Cannot create section with same name(${sectionName} )`,
          });
        } else {
          insertData.push({
            sectionName: sectionName,
            schoolId: reqObj.schoolId,
          });
        }
      }
      // })

      if (errors.length > 0) {
        return await Utils.returnResult("Section Creation", {
          ValidationErrors: errors,
        });
      }
      const paramObj = {
        model: secModel,
        data: insertData,
        insertUpdate: "insert",
        updateOnDuplicateFields: [],
        fetchRowsCond: {
          schoolId: reqObj.schoolId,
        },
        offset: 0,
        limit: 100,
        msg: "Create new sections",
        excludeFields: ["schoolId", "status", "createdAt", "updatedAt"],
        feature: "section",
        includes: [schoolAssoc],
        orderBy: [],
      };

      // bulk update the sections
      const insertSections = await Utils.bulkInsertUpdate(paramObj);

      return insertSections
        ? await Utils.returnResult(
            "section retrieval",
            insertSections.resultSet,
            null,
            insertSections.resultSet.length
          )
        : await Utils.returnResult("section update", [], false);
    } catch (err) {
      console.log("syntax:", err);
      return await Utils.catchError("section creation", err);
    }
  },
  updateASection: async (updateSectionsObj) => {
    var errors = [];

    try {
      const setData = [];
      var sections = updateSectionsObj.sections;
      var schoolId = updateSectionsObj.schoolId;
      for (i = 0; i < sections.length; i++) {
        var section = sections[i];
        var cond = {
          sectionId: section.sectionId,
        };

        //get sectionName
        var excludeFields = ["schoolId", "status", "createdAt", "updatedAt"];
        var field = "sectionName";

        var existingSectionName = await Utils.getAField(
          cond,
          field,
          secModel,
          "check whether sectionId exists or not",
          excludeFields
        );

        if (existingSectionName == null) {
          errors.push({
            sectionName: `Section does not exists with ID ${section.sectionId}`,
          });
        } else {
          if (existingSectionName != section.sectionName) {
            var cond = "";
            cond = {
              schoolId: schoolId,
              sectionName: section.sectionName,
              sectionId: {
                [op.not]: section.sectionId,
              },
            };
            const isSectionExists = await Utils.checkRowExists(
              cond,
              secModel,
              "check a section of a school"
            );
            if (isSectionExists > 0) {
              errors.push({
                sectionName: `Cannot create section with same name( ${section.sectionName})`,
              });
            } else {
              setData.push({
                sectionId: section.sectionId,
                sectionName: section.sectionName,
                schoolId: schoolId,
              });
            }
          }
        }
      }

      if (errors.length > 0) {
        return await Utils.returnResult("Section Update", {
          ValidationErrors: errors,
        });
      }

      const paramObj = {
        model: secModel,
        data: setData,
        insertUpdate: "update",
        updateOnDuplicateFields: ["sectionName", "schoolId"],
        fetchRowsCond: {
          schoolId: schoolId,
        },
        offset: 0,
        limit: 100,
        msg: "Update section/s",
        excludeFields: ["schoolId", "status", "createdAt", "updatedAt"],
        feature: "section",
        includes: [schoolAssoc],
        orderBy: [],
      };

      // bulk update the sections
      const updateSections = await Utils.bulkInsertUpdate(paramObj);

      return updateSections
        ? await Utils.returnResult(
            "section retrieval",
            updateSections.resultSet,
            null,
            updateSections.resultSet.length
          )
        : await Utils.returnResult("section update", [], false);
    } catch (err) {
      return await Utils.catchError("section update", err);
    }
  },

  getAllSections: async (schoolId, offset, limit) => {
    let cond = { schoolId };
    const totalResults = await Utils.getTotalRows(
      cond,
      secModel,
      "GetTotalRows of a school"
    );

    var offSet = await Utils.checkOffSetLimit(
      "getSections",
      offset,
      limit,
      totalResults
    );
    if (typeof offSet != "number") {
      return await Utils.returnResult("sections", false, offSet[0], null);
    }
    const excludeFields = ["schoolId", "status", "createdAt", "updatedAt"];

    const includes = [schoolAssoc];
    const orderBy = ["sectionId", "DESC"];
    const msg = "get sections of a school ";
    const fetchObjParams = {
      model: secModel,
      fetchRowsCond: cond,
      offSet,
      limit,
      msg,
      excludeFields,
      includes,
      orderBy,
    };

    const sections = await Utils.fetchRows(fetchObjParams);
    if (sections) {
      //get the total
      return await Utils.returnResult(
        "sections",
        sections.resultSet,
        null,
        totalResults
      );
    } else {
      return await Utils.returnResult("sections", false, "No records found");
    }
  },
};
