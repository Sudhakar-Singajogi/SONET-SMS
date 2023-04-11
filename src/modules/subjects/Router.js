const express = require("express");
const router = express.Router();
const path = require("path");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const Utils = require(path.resolve("src/config/utils"));
const { jwtAuthorise } =  require(path.resolve("src/services/jwt-auth-authorize"));

// const subServ = require("./services");
// const { createAssign, assignSubjectToClass, editSubject } = require("./Schema");
// const assignSubSer = require("../assignedsubjects/services");

const subServ = require(path.resolve("src/modules/subjects/services"));
const { createAssign, assignSubjectToClass, editSubject, updateSubject } = require(path.resolve("src/modules/subjects/Schema"));
const assignSubSer = require(path.resolve("src/modules/assignedsubjects/services"));


router.post(
  "/createAssign",
  jwtAuthorise("subjects", "write"),
  joiMiddleware(createAssign, "createAssignSubjects"),
  async (req, res, next) => {
    var resultSet = await assignSubSer.createAssignSubjects(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.post(
  "/assign",
  jwtAuthorise("assignedsubjects", "write"),
  joiMiddleware(assignSubjectToClass, "assignSubjectToClass"),
  async (req, res, next) => {
    var resultSet = await assignSubSer.assignSubjectToClass(req);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.patch(
  "/update",
  jwtAuthorise("subjects", "write"),
  joiMiddleware(editSubject, "updateSubjects"),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    console.log("schoolId is:", req.user.schoolId);
    var resultSet = await subServ.updateSubjects(req);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.delete(
  "/:subjectId",
  jwtAuthorise("subjects", "delete"),
  async (req, res) => {
    let subjectId = req.params.subjectId;
    const schoolId = req.user.schoolId;
    var obj = {
      subjectId,
      schoolId,
    };
    var resultSet = await subServ.deleteSubject(obj);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.get("/", jwtAuthorise("subjects", "read"), async (req, res, next) => {
  const schoolId = req.user.schoolId;
  console.log("schoolId:", req.user.schoolId);
  // var resultSet = await stdServ.createNewStudents(req.body);
  // await Utils.retrunResponse(res, resultSet);
}); 

router.get("/assignedClasses/:subjectId?", jwtAuthorise("subjects", "read"), async (req, res, next) => {
  const schoolId = req.user.schoolId;
  console.log('schoolId', schoolId) 

  const cond = { }
  cond.schoolId = schoolId;
  if (req.params.subjectId) {
    cond.subjectId = req.params.subjectId;
  }  
  cond.status = '1'; 
  var resultSet = await assignSubSer.getAssignedSubjects(cond, true);
  await Utils.retrunResponse(res, resultSet); 
}); 

router.patch(
  "/",
  jwtAuthorise("subjects", "write"),
  joiMiddleware(updateSubject, "updateSubjects"),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    console.log("schoolId is:", req.user.schoolId);

    const reqObj = {
      "schoolId":req.user.schoolId
    };

    if(req.body.hasOwnProperty('subjects')) {
      reqObj.subjects = req.body.subjects;
    }

    if(req.body.hasOwnProperty('assignedClasses')) {
      reqObj.assignedClasses = req.body.assignedClasses;
    }
    
    var resultSet = await assignSubSer.updateAssignSubject(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

module.exports = router;
