const path = require("path");
const Utils = require(path.resolve("src/config/utils")); 
const assignSubModel = require(path.resolve("src/modules/assignedsubjects/AssignedSubjects"));
const schModel = require(path.resolve("src/modules/schools/School"));
const clsModel = require(path.resolve("src/modules/classes/classes"));
const subModel = require(path.resolve("src/modules//subjects/Subjects"));
const blogic = require(path.resolve("src/config/businessLogic"));



assignSubModel.belongsTo(schModel, {
  thorugh: "schoolId",
  foreignKey: "schoolId",
});

assignSubModel.belongsTo(clsModel, {
  thorugh: "classId",
  foreignKey: "classId",
});

assignSubModel.belongsTo(subModel, {
  thorugh: "subjectId",
  foreignKey: "subjectId",
});

const exc_classAssoc = {
  model: clsModel,
  attributes: {
    exclude: ["schoolId", "status", "createdAt", "updatedAt"],
  },
};

const exc_schoolAssoc = {
  model: schModel,
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

const exc_subAssoc = {
  model: subModel,
  attributes: {
    exclude: ["schoolId", "status", "createdAt", "updatedAt"],
  },
};

const setAssignedSubjectsExcludeFields = [
  "subjectId",
  "classId",
  "schoolId",
  "status",
  "createdAt",
  "updatedAt",
];
const setSubjectsExcludeFields = [
  "schoolId",
  "status",
  "createdAt",
  "updatedAt",
];

module.exports = {
  createAssignSubjects: async (reqObj) => {
    console.log('request bidy is', reqObj)
    var errors = [];
    try {
      //check whether any subject is already existied with the school

      const subjects = reqObj.subjects;
      var insertSubjects = "";
      var insertAssignSubjects = [];
      var insertAssignClasses = "";
      const schoolId = reqObj.schoolId;

      var errors = [];

      reqObj.model = subModel;
      var resp = await blogic.validateAssignSubjects(reqObj);
      if (resp.errors.length > 0) {
        errors.push(resp.errors);
      } else {
        insertSubjects = resp.insertSubjects;
      }

      var resp = {};
      if (reqObj.hasOwnProperty("assignedClasses")) {
        reqObj.model = clsModel;

        var resp = await blogic.checkClassExists(reqObj);
        if (resp.errors.length > 0) {
          errors.push(resp.errors);
        } else {
          insertAssignClasses = resp.insertAssignClasses;
        }
      }

      if (errors.length > 0) {
        return await Utils.returnResult("Create assign subjects", {
          ValidationErrors: errors,
        });
      } else {
        //bulk insert the subjects
        const paramObj = {
          model: subModel,
          data: insertSubjects,
          insertUpdate: "insert",
          updateOnDuplicateFields: [],
          fetchRowsCond: { schoolId },
          offset: 0,
          limit: 100,
          msg: "Create new subject/s",
          excludeFields: ["status", "createdAt", "updatedAt"],
          feature: "subjects",
          includes: [],
          orderBy: [],
        };
       
        // bulk update the sections
        const subjectsCreated = await Utils.bulkInsertUpdate(paramObj);

        const resultSetObj = await Utils.returnResult(
          "section retrieval",
          subjectsCreated,
          null,
          subjectsCreated.resultSet.length
        );
        if (resultSetObj.result.success) {
          //populate inserted Subjects
          if (reqObj.hasOwnProperty("assignedClasses")) {
            const createdSubjects = resultSetObj.result.resultSet;
            const subjectsToAssign = await blogic.populateSubjects({
              createdSubjects,
              insertSubjects,
              insertAssignClasses,
            });

            if (subjectsToAssign.length > 0) {
              
              const paramObj = {
                model: assignSubModel,
                data: subjectsToAssign,
                insertUpdate: "insert",
                updateOnDuplicateFields: [],
                fetchRowsCond: { schoolId },
                offset: 0,
                limit: 100,
                msg: "Assign subjects to class",
                excludeFields: setAssignedSubjectsExcludeFields,
                feature: "AssignSubjectsToClasses",
                includes: [exc_classAssoc, exc_schoolAssoc, exc_subAssoc],
                orderBy: ["assignedId"],
              };

              const AssignedSubjects = await Utils.bulkInsertUpdate(paramObj); 
              
              return AssignedSubjects
                ? await Utils.returnResult(
                    "Create and Assign Subjects",
                    AssignedSubjects.resultSet,
                    null,
                    AssignedSubjects.resultSet.length
                  )
                : await Utils.returnResult(
                    "Create and Assign Subjects",
                    [],
                    false
                  );
            }
          } else {
            return subjectsCreated
              ? await Utils.returnResult(
                  "Create Subjects",
                  subjectsCreated.resultSet,
                  null,
                  subjectsCreated.resultSet.length
                )
              : await Utils.returnResult("Create Subjects", [], false);
          }
        } else {
          return await Utils.returnResult("Create Subjects", [], false);
        }
      }
    } catch (err) {
      console.log("errors:", err);
      return await Utils.catchError("create and assign subject", err);
    }
  },
  assignSubjectToClass: async (reqObj) => {
    const schoolId = reqObj.user.schoolId;

    //check whether the class has already assigned with the same subject or not
    var resp = {};
    reqObj.assignSubModel = assignSubModel;
    reqObj.subModel = subModel;
    reqObj.clsModel = clsModel;

    resp = await blogic.validateAssignSubjectsToClasses(reqObj);
    if (resp.errors.length > 0) {
      return await Utils.returnResult("Assign subjects", {
        ValidationErrors: resp.errors,
      });
    }

    const paramObj = {
      model: assignSubModel,
      data: resp.dataToInsert,
      insertUpdate: "insert",
      updateOnDuplicateFields: [],
      fetchRowsCond: { schoolId },
      offset: 0,
      limit: 100,
      msg: "Assign subjects to class",
      excludeFields: setAssignedSubjectsExcludeFields,
      feature: "AssignSubjectsToClasses",
      includes: [exc_classAssoc, exc_schoolAssoc, exc_subAssoc],
      orderBy: ["assignedId", "desc"],
    };

    const AssignedSubjectsResp = await Utils.bulkInsertUpdate(paramObj);

    return AssignedSubjectsResp
      ? await Utils.returnResult(
          "Assign Subjects",
          AssignedSubjectsResp.resultSet,
          null,
          AssignedSubjectsResp.resultSet.length
        )
      : await Utils.returnResult("Assign Subjects", [], false);
  },
  unAssignSubject: async (reqObj) => {
    var subjectId = reqObj.subjectId;
    var schoolId = reqObj.schoolId;
    var classId = reqObj.classId;
    var errors = [];
    var assignedSubjects = false;
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
      await assignSubModel
        .destroy({
          where: {
            subjectId,
            schoolId,
            classId,
          },
        })
        .then(async () => {
          await Utils.logToWinston("Successfully unassigned the subject");
          var paramobj = {
            model: assignSubModel,
            fetchRowConds: { schoolId },
            offset: 0,
            limit: 100,
            excludeFields: setAssignedSubjectsExcludeFields,
            feature: "AssignSubjectsToClasses",
            includes: [exc_classAssoc, exc_schoolAssoc, exc_subAssoc],
            orderBy: ["assignedId", "desc"],
          };

          assignedSubjects = await Utils.fetchRows(paramobj);
        })
        .catch(async (err) => {
          await Utils.logToWinston(
            "Failed in unassigning of the subject due to:",
            err
          );
          return await Utils.returnResult("Un assign subject", {
            ValidationErrors:
              "Failed in unassigning the subject, kindly contact administrator",
          });
        });

      return assignedSubjects
        ? await Utils.returnResult(
            "Unassign Subjects",
            assignedSubjects.resultSet,
            null,
            assignedSubjects.resultSet.length
          )
        : await Utils.returnResult("Unassign Subjects", [], false);
    }
  },
  getAssignedSubjects: async( cond, classesBySubject) => {

    const setAssignedSubjectsExcludeFields = [
      "schoolId",
      "subjectId",
      "status",
      "createdAt",
      "updatedAt",
    ];

    const param = {
      "model":assignSubModel,     
      'excludeFields':setAssignedSubjectsExcludeFields,
      includes: [exc_subAssoc, exc_classAssoc],
    }

    if(cond.length>0) {
      param.fetchRowsCond = cond;
    }

    const assignedSubs = await Utils.fetchRows(
      {
        "model":assignSubModel,
        "fetchRowsCond": cond,
        'excludeFields':setAssignedSubjectsExcludeFields,
        includes: [exc_subAssoc, exc_classAssoc],

      }
    );  
    let resSet;
    if(!classesBySubject) {
      resSet = await blogic.prepareAssignedSubjectsToClass(assignedSubs.resultSet);
    } else {
      resSet = await blogic.prepareAssignedClassesToSubject(assignedSubs.resultSet);
    }
    
    return await Utils.returnResult(
      "Assigned Subjects",
      resSet,
      null,
      resSet.length
    )
  },
  updateAssignSubject: async (reqObj) => {  
    console.log('request bidy is', reqObj)
    var errors = [];
    try {
      //check whether any subject is already existied with the school

      const subjects = reqObj.subjects;
      var insertSubjects = "";
      var insertAssignSubjects = [];
      var insertAssignClasses = "";
      const schoolId = reqObj.schoolId;
      const subjectId = reqObj.subjects[0].subjectId;

      var errors = [];

      reqObj.model = subModel;
      var resp = await blogic.validateAssignSubjects(reqObj, false);
      if (resp.errors.length > 0) {
        errors.push(resp.errors);
      } else {
        insertSubjects = resp.insertSubjects;
      } 

      var resp = {};
      if (reqObj.hasOwnProperty("assignedClasses")) {
        reqObj.model = clsModel;
        console.log('classsobjet:', reqObj);

        
        var resp = await blogic.checkClassExists(reqObj, false);
        if (resp.errors.length > 0) {
          errors.push(resp.errors);
        } else {
          insertAssignClasses = resp.insertAssignClasses;
        }
      }
      
      // console.log('classsobjet', insertAssignClasses); return false;
      if (errors.length > 0) {
        return await Utils.returnResult("Update assign subjects", {
          ValidationErrors: errors,
        });
      } else {
        //bulk insert the subjects
        const paramObj = {
          model: subModel,
          data: insertSubjects,
          insertUpdate: "update",
          updateOnDuplicateFields: ['subjectId', 'subjectName', 'schoolId', 'status','type', 'passMarks', 'totalMarks',  'createdAt'],
          fetchRowsCond: { schoolId },
          offset: 0,
          limit: 100,
          msg: "Create new subject/s",
          excludeFields: ["status", "createdAt", "updatedAt"],
          feature: "subjects",
          includes: [],
          orderBy: [],
        };

        const chkresp = [];
        const assignedSubIds = []; 
        // insertSubjects.map(async (elem)=> {
          let elem = insertSubjects[0];
          var conde = {
            schoolId:elem.schoolId,
            subjectName:elem.subjectName,
            status:1,
            subjectId
          };
          console.log('getCurrentDateTimeYMD', await Utils.getCurrentDateTimeYMD()); 

          let totalRows = await Utils.checkRowExists(conde, subModel, 'check whether subject exists or not', false);
         if( totalRows > 0) {
            var cond = {
              schoolId:elem.schoolId,
              status:1,
              subjectId
            };
            const resp = await Utils.fetchRows({'fetchRowsCond': cond, "model":assignSubModel, "excludeFields": ['subjectId', 'classId', 'schoolId', 'status', 'createdAt', 'updatedAt']});
            chkresp.push(resp); 
            chkresp[0].resultSet.map((e) => {
              assignedSubIds.push(e.assignedId)
            })
    
            console.log('assignedId are', assignedSubIds);
         }
         

        // bulk update the subjects
        const subjectsCreated = await Utils.bulkInsertUpdate(paramObj);

        const resultSetObj = await Utils.returnResult(
          "section retrieval",
          subjectsCreated,
          null,
          subjectsCreated.resultSet.length
        );
        if (resultSetObj.result.success) {
          //populate inserted Subjects
          if (reqObj.hasOwnProperty("assignedClasses")) {
            const createdSubjects = resultSetObj.result.resultSet;
            const subjectsToAssign = await blogic.populateSubjects({
              createdSubjects,
              insertSubjects,
              insertAssignClasses,
            }, 
            false);

            if (subjectsToAssign.length > 0) {
              
              const paramObj = {
                model: assignSubModel,
                data: subjectsToAssign,
                insertUpdate: "update",
                updateOnDuplicateFields: ['subjectId', 'schoolId', 'classId', 'status','createdAt', 'updatedAt'],
                fetchRowsCond: { schoolId },
                offset: 0,
                limit: 100,
                msg: "Assign subjects to class",
                excludeFields: setAssignedSubjectsExcludeFields,
                feature: "AssignSubjectsToClasses",
                includes: [exc_classAssoc, exc_schoolAssoc, exc_subAssoc],
                orderBy: ["assignedId"],
              };

              const AssignedSubjects = await Utils.bulkInsertUpdate(paramObj); 
              
              return AssignedSubjects
                ? await Utils.returnResult(
                    "Create and Assign Subjects",
                    AssignedSubjects.resultSet,
                    null,
                    AssignedSubjects.resultSet.length
                  )
                : await Utils.returnResult(
                    "Create and Assign Subjects",
                    [],
                    false
                  );
            }
          } else {
            return subjectsCreated
              ? await Utils.returnResult(
                  "Create Subjects",
                  subjectsCreated.resultSet,
                  null,
                  subjectsCreated.resultSet.length
                )
              : await Utils.returnResult("Create Subjects", [], false);
          }
        } else {
          return await Utils.returnResult("Create Subjects", [], false);
        }
      }
    } catch (err) {
      console.log("errors:", err);
      return await Utils.catchError("create and assign subject", err);
    }
  },
  
};
