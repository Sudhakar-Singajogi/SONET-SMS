const express = require("express");
const router = express.Router();
const path = require("path");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const { jwtAuthorise } =  require(path.resolve("src/services/jwt-auth-authorize"));
const Utils = require(path.resolve("src/config/utils"));


// const sectionsServ = require("./services");
// const { createStudent, editStudent, profilePicUpdate } = require("./Schema");
// let stdServ = require("./services");
// const studentsModel = require("./Students");
// const classModel = require("../classes/classes");

const sectionsServ = require(path.resolve("src/modules/students/services"));
const { createStudent, editStudent, profilePicUpdate } = require(path.resolve("src/modules/students/Schema"));
let stdServ = require(path.resolve("src/modules/students/services"));
const studentsModel = require(path.resolve("src/modules/students/Students"));
const classModel = require(path.resolve("src/modules/classes/classes"));

router.post(
  "/create",
  jwtAuthorise("students", "write"),
  joiMiddleware(createStudent, "createStudent"),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    console.log("schoolId:", req.user.schoolId);
    var resultSet = await stdServ.createNewStudents(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.patch(
  "/update/",
  joiMiddleware(editStudent),
  jwtAuthorise("students", "write"),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    var resultSet = await stdServ.updateASection(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.get("/", jwtAuthorise("students", "read"), async (req, res, next) => {
  var req = await stdServ.prepareParams(req, classModel);
  var resultSet = await stdServ.getStudents(req);
  await Utils.retrunResponse(res, resultSet);
});

router.post(
  "/uploadProfilePic",
  jwtAuthorise("students", "write"),
  joiMiddleware(profilePicUpdate),
  async (req, res, next) => {
    console.log(req.body.studentId);
    // res.send(req.files.ProfilePic)
    var resultSet = await stdServ.uploadProfilePic(req);
    await Utils.retrunResponse(res, resultSet);
  }
);

module.exports = router;
