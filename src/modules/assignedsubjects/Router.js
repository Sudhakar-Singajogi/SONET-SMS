const express = require("express");
const router = express.Router();
const path = require("path");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"))
const Utils = require(path.resolve("src/config/utils"));
const assignSubServ = require(path.resolve("src/modules/assignedsubjects/services"));
const { jwtAuthorise } = require(path.resolve("src/services/jwt-auth-authorize"));

router.get(
  "/bysubject/:subjectId?",
  jwtAuthorise("assignedsubjects", "read"),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    console.log('schoolId', schoolId) 

    const cond = { }
    cond.schoolId = schoolId;
    if (req.params.subjectId) {
      cond.subjectId = req.params.subjectId;
    }  
    cond.status = '1'; 
    var resultSet = await assignSubServ.getAssignedSubjects(cond, true);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.delete(
  "/unassign/:subjectId/:classId",
  jwtAuthorise("assignedsubjects", "delete"),
  async (req, res) => {
    let subjectId = req.params.subjectId;
    const schoolId = req.user.schoolId;
    const classId = req.params.classId;
    var obj = {
      subjectId,
      schoolId,
      classId,
    };
    var resultSet = await assignSubServ.unAssignSubject(obj);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.get("/byclass/:classId", jwtAuthorise("assignedsubjects", "read"), async (req, res, next) => {
  const schoolId = req.user.schoolId;

  const cond = { }
  cond.schoolId = schoolId;
  cond.status = '1';
  if (req.params.classId) {
    cond.classId = req.params.classId;
  }  

  var resultSet = await assignSubServ.getAssignedSubjects(cond, false);
  await Utils.retrunResponse(res, resultSet);
});

module.exports = router;
