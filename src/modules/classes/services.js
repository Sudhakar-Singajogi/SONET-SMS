const path = require("path");
const Utils = require(path.resolve("src/config/utils"));
let classModel =require(path.resolve("src/modules/classes/classes"));
// const schoolModel = require("../schools/School");
// const sectionsModel = require("../sections/Sections");
// const bLogic = require("../../config/businessLogic");
// const assignedSecModel = require("../assignedSections/AssignedSections");
// const assignedSecServ = require("../assignedSections/Services.js");

const schoolModel = require(path.resolve("src/modules/schools/School"));
const sectionsModel = require(path.resolve("src/modules/sections/Sections"));
const assignedSecModel = require(path.resolve("src/modules/assignedSections/AssignedSections"));
const assignedSecServ = require(path.resolve("src/modules/assignedSections/Services"));
const bLogic = require(path.resolve("src/config/businessLogic"));

classModel.belongsTo(schoolModel, {
  foreignKey: "schoolId",
});

sectionsModel.hasMany(schoolModel, {
  foreignKey: "schoolId",
});

const SectionAssoc = {
  model: sectionsModel,
  attributes: {
    exclude: ["schoolId", "status", "createdAt", "updatedAt"],
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

async function getTotalRows(classObj) {
  return await checkClassExists(classObj);
}

async function checkClassExists(classObj) {
  try {
    const totalClasses = await classModel.count({
      where: classObj,
      logging: (sql, queryObject) => {
        Utils.loglastExecuteQueryToWinston("check a class in a school", sql);
      },
    });
    return totalClasses;
  } catch (err) {
    return 0;
  }
}

async function updateClassValidation (newClass, validation) {
  let cond = { schoolId: newClass.schoolId, classId: newClass.classId };

  const totalClasses = await checkClassExists(cond);

  if (totalClasses == 0) {
    return await Utils.returnResult("Class Update", {
      ValidationErrors: ["No class details found"],
    });
  }
  //get the existing className
  let cond1 = { schoolId: newClass.schoolId, classId: newClass.classId };
  if (newClass.hasOwnProperty("status")) {
    cond1.status = newClass.status;
  }
  if (newClass.hasOwnProperty("className")) {
    cond1.className = newClass.className;
  }
  const classDetails = await classModel.findOne({
    where: cond1,
    attributes: {
      exclude: ["status", "createdAt", "updatedAt"],
    },
    logging: (sql, queryObject) => {
      Utils.loglastExecuteQueryToWinston("get class by Id", sql);
    },
  });

  if (classDetails) {
    return await Utils.returnResult("Validating class update", {}, 'You can update the class'); 
  } else {
    //check whether the class is already exists
    const classDetails = await classModel.findOne({
      where: { schoolId: newClass.schoolId, className: newClass.className },
      attributes: {
        exclude: ["status", "createdAt", "updatedAt"],
      },
      logging: (sql, queryObject) => {
        Utils.loglastExecuteQueryToWinston("get class by className", sql);
      },
    });
    if (classDetails) {
      if (classDetails.classId != newClass.classId) {
        return await Utils.returnResult("Class Update", {
          ValidationErrors: ["Class name already exists"],
        });
      }
    }

    if(validation === true) {
      return await Utils.returnResult("Validating class update", {}, 'You can update the class'); 
    }
    else return {"success": true};
  }
  
}

var self = (module.exports = {
// module.exports = {
  createNewClass: async (newClass) => {
    try {
      var errors = [];
      const totalClasses = await checkClassExists({
        schoolId: newClass.schoolId,
        className: newClass.className,
        status: 1,
      });

      if (totalClasses > 0) {
        errmsg = [];
        validationErrors = {ValidationErrors:["Cannot create class with same name"]};
        
        return await Utils.returnResult(
          "Class Creation",
          validationErrors
          
        );
      }

      var assignedSections = [];

      if (newClass.hasOwnProperty("assignSections")) {
        assignedSections = newClass.assignSections;
        //remove the assignedSections element from the newClass
        delete newClass.assignedSections;
      }

      if (assignedSections.length > 0) {
        var schoolId = newClass.schoolId;
        var sectionsIds = [];
        var errors = [];

        for (let index in assignedSections) {
          var section = assignedSections[index];
          console.log(section);
          var sectionName = section.sectionName;
          //get the section Id

          let fetchRowCond = {
            schoolId,
            sectionName,
          };
          const sectionField = await sectionsModel.findOne({
            where: fetchRowCond,
            limit: 1,
            attributes: {
              exclude: [
                "sectionName",
                "classId",
                "schoolId",
                "status",
                "createdAt",
                "updatedAt",
              ],
            },
            logging: async (sql, queryObject) => {
              await Utils.loglastExecuteQueryToWinston(
                "Get a " + "sectionId" + " from " + "sections" + " table",
                sql
              );
            },
          });

          if (!sectionField) {
            errors.push({ Section: `Section (${sectionName}) not found` });
          } else {
            var sectionId = sectionField.sectionId;
            sectionsIds.push(sectionId);
          }
        }
      }

      if (errors.length > 0) {
        return await Utils.returnResult("Create Assign Sections", {
          ValidationErrors: errors,
        });
      }

      const createdClass = await classModel.create({
        ...newClass,
        logging: (sql, queryObject) => {
          Utils.loglastExecuteQueryToWinston("create a new class", sql);
        },
      });

      if (assignedSections.length > 0) {
        var sectionsAssigned = [];

        for (let index in assignedSections) {
          var section = assignedSections[index];
          var sectionId = sectionsIds[index];
          var classId = createdClass.classId;
          sectionsAssigned.push({
            sectionId,
            classId,
            schoolId,
          });
        }

        //bulk insert the assigned sections to the class

        var data = sectionsAssigned;
        var model = assignedSecModel;
        var insertUpdate = "insert";
        var excludeFields = await Utils.getTableColumns(
          assignedSecModel,
          "exclude",
          false
        );
        var updateOnDuplicateFields = await Utils.getTableColumns(
          assignedSecModel,
          "include",
          true
        );
        var fetchRowsCond = { schoolId, classId };
        var offset = 0;
        var limit = 100;
        var msg = "Assign Sections";
        var excludeFields = excludeFields;
        var feature = "createNewClass";
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
          orderBy,
        };

        const assignSectionsResp = await Utils.bulkInsertUpdate(paramObj);
        if (assignSectionsResp.success) {
          let assignedssections_Class =
            await assignedSecServ.getAssignedSections({ classId, schoolId });
          if (assignedssections_Class.resultSet.length == 0) {
            return await Utils.returnResult(
              "Assigned Sections",
              false,
              "No records found"
            );
          }
          const resp = await Utils.returnResult(
            "classes",
            assignedssections_Class.resultSet,
            null,
            assignedssections_Class.resultSet.length
          );
          return resp;
        }
      } else {
        return createdClass
          ? await Utils.returnResult(
              "class creation",
              await classModel.findOne({
                where: { classId: createdClass.classId },
                include: [SchoolAssoc],
                attributes: {
                  exclude: ["schoolId", "status", "createdAt", "updatedAt"],
                },
              })
            )
          : await Utils.returnResult("class creation", classModel, false);
      }
    } catch (err) {
      return await Utils.catchError("class creation", err);
    }
  },
  getClassesBySchool: async (schoolId, offset, limit) => {
    var totalResults = await getTotalRows({ schoolId: schoolId });
    totalResults = parseInt(totalResults);

    var offSet = await Utils.checkOffSetLimit(
      "classes",
      offset,
      limit,
      totalResults
    );
    if (typeof offSet != "number") {
      return await Utils.returnResult("classes", false, offSet[0], null);
    }

    const classes = await classModel.findAll({
      where: { schoolId: schoolId },
      offset: offSet,
      limit: limit != "" ? parseInt(limit) : 10,
      include: [SchoolAssoc],
      attributes: {
        exclude: ["schoolId", "status", "createdAt", "updatedAt"],
      },
      logging: (sql, queryObject) => {
        Utils.loglastExecuteQueryToWinston("get class of a school school", sql);
      },
    });

    if (classes) {
      //get the total
      return await Utils.returnResult("classes", classes, null, totalResults);
    } else {
      return await Utils.returnResult("classes", false, "No records found");
    }
  },
  updateAClass: async (newClass, validation) => {
    if(validation === true) {
      return await updateClassValidation(newClass, validation)
    }
    let cond = { schoolId: newClass.schoolId, classId: newClass.classId, status: 1}; 

    // const totalClasses = await checkClassExists(cond); 
      const totalClasses = await classModel.count({
        where: cond,
        logging: (sql, queryObject) => {
          Utils.loglastExecuteQueryToWinston("check a class in a school", sql);
        },
      }); 
      if (totalClasses == 0) {
      return await Utils.returnResult("Class Update", {
        ValidationErrors: ["No class details found or class is inactive"],
      });
    } else {
      //check whether the class is already exists
      const classDetails = await classModel.findOne({
        where: { schoolId: newClass.schoolId, status: 1, className: newClass.className },
        attributes: {
          exclude: ["status", "createdAt", "updatedAt"],
        },
        logging: (sql, queryObject) => {
          Utils.loglastExecuteQueryToWinston("get class by className", sql);
        },
      });
      if (classDetails) {
        if (classDetails.classId != newClass.classId) {
          return await Utils.returnResult("Class Update", {
            ValidationErrors: ["Class name already exists"],
          });
        }
      }

      if(validation === true) {
        return await Utils.returnResult("Validating class update", {}, 'You can update the class');  
      }

      newClass.updatedAt = await Utils.getCurrentDateTimeYMD()
      
      var resSet = await classModel
        .update(newClass, {
          where: cond,
        })
        .then(async () => {
          return await classModel.findByPk(newClass.classId, {
            attributes: {
              exclude: ["status", "createdAt", "updatedAt"],
            },
          });
        });
      console.log('resSet', resSet)
      return resSet
        ? await Utils.returnResult("Classes", resSet)
        : await Utils.returnResult(
            "Classes",
            false,
            "Unable to update class, kidnly contact DBA"
          );
    }
  },
  checkClassExistance: async(cond) => {

    // return cond;

    const totalClasses = await checkClassExists(cond); 

    if (totalClasses > 0) {
      validationErrors = {ValidationErrors:["Cannot create class with same name"]}; 
      return  await Utils.returnResult(
        "Class Creation",
        validationErrors
      ); 
    } else {
      return  await Utils.returnResult( "class does not exists", {}, 'Class does not exists, you can choose this class name'); 
    } 

  },
  isClassUpdateValid : async(newClass, validating) => {
  return await updateClassValidation(newClass, validating)
  },
  updateClassWithSections: async(classObj, assignedSections) => {
    const resp = await self.updateAClass(classObj, false)
    if(resp.message === 'Query Success') {
      
      /** Here we are going to delete the assigned sections to this class and we have to assign the newly added sections to the class */
      const assignedSecDelCond  = {
        "schoolId":classObj.schoolId,
        "classId":classObj.classId
      }
      
      await assignedSecModel.destroy({
        where: assignedSecDelCond,
      });

      if(assignedSections.length > 0) {
        const assignSectionsBody = {
          "schoolId":classObj.schoolId,
          "classId":classObj.classId,
          "assignedSections": assignedSections
        }

       const assignedClassSections =  await assignedSecServ.assignSections(assignSectionsBody, true);

       if(assignedClassSections.success) {
        return await Utils.returnResult("Update class and sections", {}, null); 
       }

      } else {
        return await Utils.returnResult("Update class and sections", {}, null); 
      }

    } else {
      return await Utils.returnResult("Update class name", {"ValidationErrors" : ["Class update not success, Please contact the DB Admn"]}, 'Class update not success, Please contact the DB Admn');  
    } 
  }
});
