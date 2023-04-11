const Utils = require("./utils");
const { Op } = require("sequelize");
const clsModel = require("../modules/classes/classes");
const e = require("express");

async function validateAssignSubjects(params, createAssign=true) {

  console.log('params are :', params)
  console.log('createAssign is :', createAssign)

  var subjects = params.subjects;
  const subModel = params.model;
  
  const insertSubjects = [];
  const schoolId = params.schoolId;
  var errors = [];

  for (i = 0; i < subjects.length; i++) {
    var subjectName = subjects[i].subjectName;
    if(createAssign === false) {
      var subjectId = subjects[0].subjectId;
    }    
    
    var cond = { subjectName, schoolId };

    var type = subjects[i].type;
    var passMarks = subjects[i].passMarks;
    var totalMarks = subjects[i].totalMarks;

    let rowExists;
    if(createAssign) {
       rowExists = await Utils.checkRowExists(
        cond,
        subModel,
        "check subject (" + subjectName + ") already exists in the school"
      );
    } else {
      cond.subjectId = subjectId;
      console.log('conditionis:', cond)
      cond = {
        subjectName, schoolId,
        subjectId: { [Op.ne]: subjectId } 
      }
       rowExists = await Utils.checkRowExists(
        cond,
        subModel,
        "check subject (" + subjectName + ") already exists in the school"
      ); 
    }
    

    if (parseInt(rowExists) > 0) {
      errors.push({
        subject: "Cannot create subject with same name(" + subjectName + ")",
      });
    } else {
      if(createAssign) {
        insertSubjects.push({
          subjectName,
          schoolId,
          type,
          passMarks,
          totalMarks
        });
      } else {
        insertSubjects.push({
          subjectId,
          subjectName,
          schoolId,
          type,
          passMarks,
          totalMarks,
          updatedAt:await Utils.getCurrentDateTimeYMD()

        });
      }
      
    }
  }

  return { errors, insertSubjects };
}

async function checkClassExists(params, createAssign = true) {
  console.log("reqObj", params);
  const clsModel = params.model;
  const insertAssignClasses = [];
  const schoolId = params.schoolId;
  var errors = [];

  const classes = params.assignedClasses;

  for (j = 0; j < classes.length; j++) {
    var classId = classes[j].classId;
    console.log("classId:", classId);
    var className = classes[j].className;
    var cond = { classId, schoolId };

    const rowExists = await Utils.checkRowExists(
      cond,
      clsModel,
      "check class(" + className + ")  exists or not in the school"
    );
    if (parseInt(rowExists) == 0) {
      errors.push({
        className:
          "Cannot find class(" + className + ") with classId(" + classId + ")",
      });
    } else {
      if(createAssign) {
        insertAssignClasses.push({
          classId,
          schoolId,
        });
      } else {
        if(classes[j].hasOwnProperty('assignedId')) {
          insertAssignClasses.push({
            classId,
            schoolId,
            "assignedId": classes[j].assignedId
          });
        } else {
          insertAssignClasses.push({
            classId,
            schoolId
          });
        }
        
      }
    }
  }

  return { errors, insertAssignClasses };
}

async function populateSubjects(obj, createAssign=true)  {
  var subjectsToAssign = [];
  var assignSubjectsToClass = [];
  console.log("insertAssignClasses:", obj.insertAssignClasses);
  console.log("createAssign:", createAssign);

  for (var property in obj.createdSubjects) {
    obj.insertSubjects.forEach((element) => {
      if (element.subjectName == obj.createdSubjects[property].subjectName) {
        subjectsToAssign.push(obj.createdSubjects[property].subjectId);
        for (var prop in obj.insertAssignClasses) {
          if(createAssign === true) {
            assignSubjectsToClass.push({
              subjectId: obj.createdSubjects[property].subjectId,
              classId: obj.insertAssignClasses[prop].classId,
              schoolId: obj.insertAssignClasses[prop].schoolId,
            });

          } else {
            if(obj.insertAssignClasses[prop].hasOwnProperty('assignedId')) {
              assignSubjectsToClass.push({
                subjectId: obj.createdSubjects[property].subjectId,
                classId: obj.insertAssignClasses[prop].classId,
                schoolId: obj.insertAssignClasses[prop].schoolId,
                assignedId:obj.insertAssignClasses[prop].assignedId,
              });
            }else {
              assignSubjectsToClass.push({
                subjectId: obj.createdSubjects[property].subjectId,
                classId: obj.insertAssignClasses[prop].classId,
                schoolId: obj.insertAssignClasses[prop].schoolId,
              });
            }
            
          }
          
        }
      }
    });
  }
  return assignSubjectsToClass;
}

async function validateAssignSubjectsToClasses(obj) {
  console.log("requested Object:", obj);
  var errors = [];
  var dataToInsert = [];
  var assignSubjects = obj.body.assignSubjects;
  var schoolId = obj.user.schoolId;

  for (var prop in assignSubjects) {
    var subjectId = assignSubjects[prop].subjectId;
    var classId = assignSubjects[prop].classId;
    var subExists = await Utils.checkRowExists(
      { subjectId },
      obj.subModel,
      "check subject exists or not"
    );
    if (subExists == 0) {
      errors.push({
        subject:
          "Cannot find subject (" +
          assignSubjects[prop].subjectName +
          ") with subjectId(" +
          subjectId +
          ")",
      });
    }

    var clsExists = await Utils.checkRowExists(
      { classId },
      obj.clsModel,
      "check subject exists or not"
    );
    if (clsExists == 0) {
      errors.push({
        subject:
          "Cannot find class (" +
          assignSubjects[prop].className +
          ") with classId(" +
          classId +
          ")",
      });
    }
  }

  if (errors.length == 0) {
    //check whether the class has already assigned with the same subject or not

    for (var prop in assignSubjects) {
      var subjectId = assignSubjects[prop].subjectId;
      var classId = assignSubjects[prop].classId;
      var subExists = await Utils.checkRowExists(
        { subjectId, classId, schoolId },
        obj.assignSubModel,
        "check subject already assigned to the class or not"
      );
      if (subExists > 0) {
        errors.push({
          subject:
            "Subject (" +
            assignSubjects[prop].subjectName +
            ") already assigned to the class(" +
            assignSubjects[prop].className +
            ")",
        });
      } else {
        dataToInsert.push({
          subjectId,
          classId,
          schoolId,
        });
      }
    }
  }

  return { errors, dataToInsert };
}

async function validateSubjectsOfASchool(obj) {
  var errors = [];
  var dataToUpdate = [];
  var schoolId = obj.user.schoolId;
  var subjects = obj.body.updateSubjects;

  for (var prop in subjects) {
    var subjectId = subjects[prop].subjectId;
    var subjectName = subjects[prop].subjectName;
    var subExists = await Utils.checkRowExists(
      { subjectId, schoolId },
      obj.subModel,
      "Check subject exists or not"
    );

    if (subExists == 0) {
      errors.push({
        subject: `Cannot find subject ${assignSubjects[prop].subjectName}) in your school`,
      });
    } else {
      //get the subject
      var paramobj = {
        model: obj.subModel,
        fetchRowCond: { subjectId },
        excludeFields: await Utils.getTableColumns(
          obj.subModel,
          "exclude",
          false
        ),
      };
      var resp = await Utils.getRowByPk(paramobj);

      if (!resp.success) {
        errors.push({
          subject: `Subject(${subjectName}) does not exists)`,
        });
      } else {
        var subjectObj = resp.resultSet;
        var subject = {
          subjectId: subjectObj.subjectId,
          subjectName: subjectObj.subjectName,
          schoolId: subjectObj.schoolId,
          status: subjectObj.status,
        };
        if (subjects[prop].hasOwnProperty("subjectName")) {
          subject.subjectName = subjects[prop].subjectName;
        }

        if (subjects[prop].hasOwnProperty("status")) {
          subject.status = subjects[prop].status;
        }
        dataToUpdate.push(subject);
        console.log("subject", subject);
      }
    }
  }

  return { errors, dataToUpdate };
}

async function validateCreateAssignpermission(obj) {
  const permissions = obj.permissions;
  const model = obj.model;
  let message = "Check whether permission already exists or not";
  var insertPermissions = [];
  var errors = [];

  for (let index in permissions) {
    let cond = {};
    cond.name = permissions[index].name;
    cond.schoolId = obj.schoolId;

    let name = permissions[index].name;

    const isPermExists = await Utils.checkRowExists(cond, model, message);
    if (isPermExists) {
      errors.push({
        permission: `Permission name ${name} cannot be duplicate`,
      });
    }
  }
  //check whether ww got any validation errors
  if (errors.length > 0) {
    return { errors, insertPermissions };
  }

  for (let outerCnt in permissions) {
    let permission = permissions[outerCnt];
    let name = permission.name;
    let modules = permission.modules;
    let schoolId = obj.schoolId;

    for (let innerCnt in modules) {
      let cond = {};
      cond.moduleId = modules[innerCnt].moduleId;
      cond.module = modules[innerCnt].name;

      let name = permission.name;
      let moduleId = modules[innerCnt].moduleId;
      let read = permission.read ? "1" : "0";
      let write = permission.write ? "1" : "0";
      let del = permission.delete ? "1" : "0";

      let model = obj.featuresmodel;
      let message = "check whether feature already exists or not";

      //check whether the module exists or not
      const isFeatureExists = await Utils.checkRowExists(cond, model, message);
      console.log("isPermExists", isFeatureExists);
      if (isFeatureExists == 0) {
        errors.push({
          Feature: `feature name(${modules[innerCnt].name}) with  moduleId(${modules[innerCnt].moduleId}) does not exists`,
        });
      } else {
        insertPermissions.push({
          schoolId,
          name,
          moduleId,
          read,
          write,
          delete: del,
        });
      }
    }
  }

  return { errors, insertPermissions };
}

async function prepareModulePermissions(respObj) {
  var respObjData = respObj.result;

  var perArray = [];

  for (let cnt in respObjData) {
    if (perArray.indexOf(respObjData[cnt].name) !== -1) {
    } else {
      var permissionName = respObjData[cnt].name;
      perArray[perArray.length] = permissionName;
    }
  }

  uniquePermissionsArray = perArray.filter(function (item, pos, self) {
    return self.indexOf(item) == pos;
  });

  var modulepermissions = [];
  for (let i in uniquePermissionsArray) {
    modulepermissions.push({});
  }

  for (let cnt in respObjData) {
    if (uniquePermissionsArray.indexOf(respObjData[cnt].name) !== -1) {
      var index = uniquePermissionsArray.indexOf(respObjData[cnt].name);
      var pername = uniquePermissionsArray[index];
      var moduleWithperm = {
        moduleId: respObjData[cnt].moduleId,
        module: respObjData[cnt].Module.module,
      };
      var permissions = {
        read: respObjData[cnt].read,
        write: respObjData[cnt].write,
        delete: respObjData[cnt].delete,
      };

      if (modulepermissions[index].hasOwnProperty("permissionName")) {
      } else {
        modulepermissions[index].permissionName = pername;
      }
    }

    if (modulepermissions[index].hasOwnProperty("modules")) {
      modulepermissions[index].modules.push(moduleWithperm);
    } else {
      modulepermissions[index].modules = [moduleWithperm];
    }

    if (modulepermissions[index].hasOwnProperty("permissions")) {
    } else {
      modulepermissions[index].permissions = permissions;
    }
  }
  respObj.totalRows = modulepermissions.length;
  respObj.result = modulepermissions;
  return respObj;
}

async function validateAssignPermissions(obj) {
  const emptyObj = {};
  const assignedpermissions = obj.assignPermissions;
  const schoolId = obj.schoolId;
  const model = obj.model;
  let message = "check whether permission already exists or not";
  var insertPermissions = [];
  var errors = [];

  for (let index in assignedpermissions) {
    let cond = {};
    cond.name = assignedpermissions[index].permission;
    cond.schoolId = obj.schoolId;
    let permission = assignedpermissions[index].permission;

    const isPermExists = await Utils.checkRowExists(cond, model, message);
    console.log("isPermExists", isPermExists);
    if (isPermExists == 0) {
      errors.push({
        permission: `Permission name ${permission} doesnot exists`,
      });
    }
  }
  if (errors.length) {
    return { errors, emptyObj };
  }

  //check whether modules exists or not
  message = "check whether feature already exists or not";
  for (let index in assignedpermissions) {
    let modules = assignedpermissions[index].modules;
    let permissionName = assignedpermissions[index].permission;
    for (let j in modules) {
      let cond = {};
      cond.module = modules[j].name;
      cond.moduleId = modules[j].moduleId;
      let model = obj.featuresmodel;

      let moduleName = modules[j].name;
      let moduleId = modules[j].moduleId;

      const isFeatureExists = await Utils.checkRowExists(cond, model, message);
      console.log("isFeatureExists", isFeatureExists);
      if (isFeatureExists == 0) {
        errors.push({
          Feature: `Feature name ${moduleName} with moduleId (${moduleId}) doesnot exists`,
        });
      } else {
        //check whether the module is already assigned to this permission or not
        message =
          "check whether feature already assigned to this permission or not";
        let condition = {
          schoolId,
          name: permissionName,
          moduleId,
        };
        const isFeatureAssignedWithPermission = await Utils.checkRowExists(
          condition,
          obj.model,
          message
        );

        console.log(
          "isFeatureAssignedWithPermission",
          isFeatureAssignedWithPermission
        );
        if (isFeatureAssignedWithPermission) {
          errors.push({
            Feature: `Feature name ${moduleName} with moduleId (${moduleId}) already assigned to permisison ${permissionName}`,
          });
        } else {
          let name = permissionName;
          let moduleId = modules[j].moduleId;

          //get the permission by permisionName
          let permissionRow = await Utils.findAll({
            model: obj.model,
            fetchRowCond: {
              schoolId,
              name: permissionName,
            },
          });

          let read = permissionRow.resultSet[0].read;
          let write = permissionRow.resultSet[0].writer;
          let del = permissionRow.resultSet[0].delete;

          insertPermissions.push({
            schoolId,
            name,
            moduleId,
            read,
            write,
            delete: del,
          });
        }
      }
    }
  }
  return { errors, insertPermissions };
}
async function editAssignpermissions(obj) {
  const emptyObj = {};
  const assignedpermissions = obj.assignedPermissions;
  const schoolId = obj.schoolId;
  const model = obj.model;
  let message = "check whether permission already exists or not";
  var insertPermissions = [];
  var errors = [];

  //check whether the pemission
  for (let cnt in assignedpermissions) {
    let permission = assignedpermissions[cnt];
    let cond = {};
    cond.schoolId = schoolId;
    cond.name = permission.permissionName;

    const isPermissionExists = await Utils.checkRowExists(
      cond,
      obj.model,
      message
    );

    if (isPermissionExists == 0) {
      errors.push({
        Permission: `Permission (${permission.permissionName}) does not exists`,
      });
    }
  }

  if (errors.length > 0) {
    return { errors, emptyObj };
  }
  //prepare the update object
  //first get the row by permisionName

  for (let cnt in assignedpermissions) {
    let permission = assignedpermissions[cnt];
    let cond = {};
    cond.schoolId = schoolId;
    cond.name = permission.permissionName;

    var obj = {
      model: obj.model,
      fetchRowCond: {
        schoolId,
        name: permission.permissionName,
      },
    };
    const permissionRow = await Utils.findOne(obj);

    if (permissionRow.success) {
      //prepare the object and insertinto insertPermissions
      let obj = {
        permissionId: permissionRow.resultSet.permissionId,
        schoolId: permissionRow.resultSet.schoolId,
        name: permissionRow.resultSet.name,
        moduleId: permissionRow.resultSet.moduleId,
        read: permissionRow.resultSet.read,
        write: permissionRow.resultSet.write,
        delete: permissionRow.resultSet.delete,
      };

      if (permission.hasOwnProperty("newPermissionName")) {
        obj.name = permission.newPermissionName;
      }

      if (permission.hasOwnProperty("read")) {
        if (permission.read) {
          obj.read = "1";
        } else {
          obj.read = "0";
        }
      }

      if (permission.hasOwnProperty("write")) {
        if (permission.write) {
          obj.write = "1";
        } else {
          obj.write = "0";
        }
      }

      if (permission.hasOwnProperty("delete")) {
        if (permission.delete) {
          obj.delete = "1";
        } else {
          obj.delete = "0";
        }
      }
      insertPermissions.push(obj);
      obj = {};
    } else {
      await Utils.logToWinston(
        `Unable to fetch permission (${permission.permissionName})`,
        permissionRow.error
      );
      errors.push({
        Permission: `Fetching Permission (${permission.permissionName}) has some issues kindly contact admin`,
      });
      return { errors, emptyObj };
    }
  }
  return { errors, insertPermissions };
}

async function deletePermissons(obj) {
  const emptyObj = {};
  const permissions = obj.permissions;
  const schoolId = obj.schoolId;
  const model = obj.model;
  let message = "check whether permission already exists or not";
  var insertPermissions = [];
  var errors = [];
  let assignedroles = obj.assignedroles;

  //check whether the pemission
  for (let cnt in permissions) {
    let permission = permissions[cnt];
    let cond = {};
    let permissionIds;
    cond.schoolId = schoolId;
    cond.name = permission.permissionName;

    const isPermissionExists = await Utils.checkRowExists(
      cond,
      obj.model,
      message
    );

    if (isPermissionExists == 0) {
      errors.push({
        Permission: `Permission (${permission.permissionName}) does not exists`,
      });
    } else {
      //get the permissionIds assigned to the modules for the permission
      let name = permission.permissionName;
      var params = {
        model: obj.model,
        fetchRowsCond: {
          schoolId,
          name,
        },
        excludeFields: [
          "schoolId",
          "name",
          "moduleId",
          "read",
          "write",
          "delete",
          "createdAt",
          "updatedAt",
        ],
      };
      const permissionAssigned = await Utils.fetchRows(params);

      console.log("permissionAssigned", permissionAssigned);
      if (!permissionAssigned.success) {
        await Utils.logToWinston(
          `Unable to fetch permission (${permission.permissionName})`,
          permissionAssigned.errorMs
        );
        errors.push({
          Permission: `Fetching Permission (${permission.permissionName}) has some issues kindly contact admin`,
        });
      } else {
        permissionIds = permissionAssigned.resultSet;
      }
    }

    if (errors.length > 0) {
      return { errors, emptyObj };
    }
    for (let j in permissionIds) {
      let permissionId = permissionIds[j].permissionId;
      console.log("permissionId is", permissionId);
      //unassign this permission to role/s

      await assignedroles
        .destroy({
          where: {
            permissionId,
          },
        })
        .then(async () => {
          await Utils.logToWinston(
            `Successfully unassigned the permission ${permission.permissionName} to roles`
          );
        })
        .catch(async (err) => {
          await Utils.logToWinston(
            "Failed in unassigning of the permissions due to:",
            err
          );
          errors.push({
            Permission: `Failed in unassigning permission ${permission.permissionName} to roles, kindly contact administrator`,
          });
        });
    }

    let perModel = obj.model;
    //deelte the permission from permission table
    await perModel
      .destroy({
        where: {
          schoolId,
          name: permission.permissionName,
        },
      })
      .then(async () => {
        await Utils.logToWinston(
          `Successfully unassigned the permission ${permission.permissionName} to roles`
        );
      })
      .catch(async (err) => {
        await Utils.logToWinston(
          "Failed in unassigning of the permissions due to:",
          err
        );
        errors.push({
          Permission: `Failed in unassigning permission ${permission.permissionName} to roles, kindly contact administrator`,
        });
      });
  }
  return { errors, emptyObj };
}

async function prepareAssignedsectionsByclass(arrObj, preCond, order) {
  var resultantObj = [];
  var AssignedClass = [];
  var School = arrObj[0].school;

  arrObj.map((assignedsectionsObj) => {
    AssignedClass.push(assignedsectionsObj.class.className);
  });

  AssignedClass = Array.from(new Set(AssignedClass));

  for (let i in AssignedClass) {
    resultantObj.push({
      className: AssignedClass[i],
      classId: "",
      assignedSections: [],
      scchool: School,
    });
  }

  for (let cnt in arrObj) {
    if (AssignedClass.indexOf(arrObj[cnt].class.className) !== -1) {
      var index = AssignedClass.indexOf(arrObj[cnt].class.className);
      var section = {
        sectionId: arrObj[cnt].section.sectionId,
        sectionName: arrObj[cnt].section.sectionName,
        assignedSectionId: arrObj[cnt].assignedId,
      };

      resultantObj[index].assignedSections.push(section);
      resultantObj[index].classId = arrObj[cnt].classId;
    }
  }
  if( !preCond.hasOwnProperty('classId')) {

  
  //get the classes for which no sections are assigned

  const classesUnassigned = await clsModel.findAll({
    where: {
      className: {
        [Op.notIn]: AssignedClass,
      },
    },
    attributes: {
      exclude: ["schoolId", "status", "createdAt", "updatedAt"],
    },
  });

  if (classesUnassigned.length > 0) {
    classesUnassigned.map((classObj) => {
      // console.log('className is', classObj.className)

      resultantObj.push({
        className: classObj.className,
        classId: classObj.classId,
        assignedSections: [],
        scchool: School,
      });
    });
  }
}
  //sort the resultantObj in ascending order by classId
  if(order === 'asc') {
    resultantObj.sort((a, b) => parseInt(a.classId) - parseInt(b.classId));
  } else {
    resultantObj.sort((a, b) => parseInt(b.classId) - parseInt(a.classId));
  }
console.log('order', order)
  return {
    totalRows: resultantObj.length,
    resultSet: resultantObj,
  };
}

async function validateAssigned_UnassignedSections(reqBody) {
  var errors = [];
  var assignedSections = reqBody.assignedSections;
  var schoolId = reqBody.schoolId;
  var classId = reqBody.classId;
  var assignSectionsToClass = [];

  const clsModel = reqBody.clsModel;
  const sectionsModel = reqBody.sectionsModel;
  const assignedSecModel = reqBody.assignedSecModel;

  //check whether the class exists or not

  var excFields = ["schoolId", "status", "createdAt", "updatedAt"];
  var field = "className";

  var className = await Utils.getAField(
    { classId, schoolId },
    field,
    clsModel,
    `Check whether the classId(${classId}) exists or not`,
    excFields
  );

  if (className == null) {
    return await Utils.returnResult("Assign sections to a class", {
      ValidationErrors: [{ classId: `classId(${classId}) does exists` }],
    });
  }

  for (i = 0; i < assignedSections.length; i++) {
    var hasError = 0;
    var section = assignedSections[i];
    var sectionId = section.sectionId;
    var cond = {
      sectionId,
      schoolId,
    };

    //get sectionName
    var sectionExcFields = [
      "sectionId",
      "sectionName",
      "schoolId",
      "status",
      "createdAt",
      "updatedAt",
    ];
    var field = "sectionName";

    var existingSectionName = await Utils.getAField(
      cond,
      field,
      sectionsModel,
      "check whether sectionId exists or not",
      sectionExcFields
    );

    console.log("existingSectionName", existingSectionName);

    if (existingSectionName == null) {
      hasError = 1;
      errors.push({
        sectionName: `sectionId: ${section.sectionId} and sectionName: ${section.sectionName} combination does not exists `,
      });
    }

    //check whether the same section is assigned to the class or not
    var sectionExcFields = [
      "assignedId",
      "sectionId",
      "classId",
      "schoolId",
      "status",
      "createdAt",
      "updatedAt",
    ];
    var field = "assignedId";
    cond.classId = classId;

    console.log("condition is ", cond);

    var assignedId = await Utils.getAField(
      cond,
      field,
      assignedSecModel,
      `check whether section(${section.sectionName}) already assigned to the class or not`,
      sectionExcFields
    );

    if (reqBody.req == "unassign") {
      if (assignedId == null) {
        hasError = 1;
        errors.push({
          sectionName: `${section.sectionName} not yet assigned to the classId: ${classId}`,
        });
      }
    } else {
      if (assignedId) {
        hasError = 1;
        errors.push({
          sectionName: `${section.sectionName} already assigned to the classId: ${classId}`,
        });
      }
    }

    if (hasError == 0) {
      assignSectionsToClass.push({
        sectionId,
        classId,
        schoolId,
      });
    }
  }

  return {
    errors: errors,
    assignSectionsToClass: assignSectionsToClass,
  };
}


async function prepareAssignedSubjectsToClass(resulset) {
const classArr = [];
const retObj = [];
resulset.map((obj)=> {
  
  if(classArr.includes(`class_${obj.classId}`) === false){
    classArr.push(`class_${obj.classId}`);
    if(obj.subject) {
      retObj.push({
        "class": obj.class,
        "subject":[{
            "assignedSubjectId":obj.assignedId,
            "subjectId": obj.subject.subjectId,
            "subjectName": obj.subject.subjectName,
            "type": obj.subject.type,
            "passMarks": obj.subject.passMarks,
            "totalMarks": obj.subject.totalMarks
        }]
      
      })
    }
  } else {
    const index = classArr.indexOf(`class_${obj.classId}`)
    if(obj.subject) {
      retObj[index].subject.push( 
        {
          "assignedSubjectId":obj.assignedId,
          "subjectId": obj.subject.subjectId,
          "subjectName": obj.subject.subjectName,
          "type": obj.subject.type,
          "passMarks": obj.subject.passMarks,
          "totalMarks": obj.subject.totalMarks
      }
       )
    }
  }
});


return retObj;


}



async function prepareAssignedClassesToSubject(resulset) {
  const subArr = [];
  const retObj = [];
  resulset.map((obj)=> {

    if(obj.subject) {
    
      if(subArr.includes(obj.subject.subjectName) === false){
        subArr.push(obj.subject.subjectName); 
          retObj.push({
            "subject":{
                "subjectId": obj.subject.subjectId,
                "subjectName": obj.subject.subjectName,
                "type": obj.subject.type,
                "passMarks": obj.subject.passMarks,
                "totalMarks": obj.subject.totalMarks
            },
            "assignedSubjectIds":[obj.assignedId],
            "class": [obj.class],          
          }) 
      } else {
          const index = subArr.indexOf(obj.subject.subjectName);
          retObj[index].class.push(obj.class);
          retObj[index].assignedSubjectIds.push(obj.assignedId);
      }
    }
  });
  
  
  return retObj;
  
  
  }

module.exports = {
  validateAssignSubjects,
  checkClassExists,
  validateAssignSubjectsToClasses,
  populateSubjects,
  validateSubjectsOfASchool,
  validateCreateAssignpermission,
  prepareModulePermissions,
  validateAssignPermissions,
  editAssignpermissions,
  deletePermissons,
  prepareAssignedsectionsByclass,
  validateAssigned_UnassignedSections,
  prepareAssignedSubjectsToClass,
  prepareAssignedClassesToSubject
};
