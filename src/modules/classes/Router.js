const express = require("express");
const router = express.Router();
const path = require("path");

const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const { jwtAuthorise } =  require(path.resolve("src/services/jwt-auth-authorize"));
const Utils = require(path.resolve("src/config/utils"));

// const classesServ = require("./services");
// const { createNewClass, editAClass } = require("./Schema");
// let clsModel = require("./classes");

const classesServ = require(path.resolve("src/modules/classes/services"));
const { createNewClass, editAClass, editClassWithSections } = require(path.resolve("src/modules/classes/Schema"));
let clsModel = require(path.resolve("src/modules/classes/classes"));
const assignSubServ = require(path.resolve("src/modules/assignedsubjects/services"));


router.get(
  "/checkClassExistance",
  jwtAuthorise("classes", "read"),
  async (req, res, next) => {
    const cond = {
      schoolId: req.user.schoolId,        
    }; 

    if (req.query.classnameid) {
      if(typeof req.query.classnameid === 'string') {
        cond.className = req.query.classnameid; 
      } else if (typeof req.query.classnameid === 'number' && req.params.classnameid > 0) {
        cond.classId = req.query.classnameid;
      }
      cond.status = 1;
    } 

    var resultSet = await classesServ.checkClassExistance(cond); 
    await Utils.retrunResponse(res, resultSet);
  }
);
router.get("/assignedsubjects/:classId?", jwtAuthorise("subjects", "read"), async (req, res, next) => {
    const schoolId = req.user.schoolId;

    const cond = { }
    cond.schoolId = schoolId;
    cond.status = '1';
    if (req.params.classId) {
      cond.classId = req.params.classId;
    }  
    cond.status = '1'; 
  var resultSet = await assignSubServ.getAssignedSubjects(cond, false);
  await Utils.retrunResponse(res, resultSet);
}); 

router.get(
  "/:offset?/:limit?",
  jwtAuthorise("classes", "read"),
  async (req, res, next) => {
    
    const schoolId = req.user.schoolId;
    let offset = 0;
    let limit = 10;
    if (req.params.offset) {
      offset = req.params.offset;
      limit = req.params.limit;
    }

    var resultSet = await classesServ.getClassesBySchool(
      schoolId,
      offset,
      limit
    );
    await Utils.retrunResponse(res, resultSet);
  }
);

router.post(
  "/create",
  jwtAuthorise("classes", "write"),
  joiMiddleware(createNewClass),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    console.log("schoolId:", req.user.schoolId);

    clsModel = req.body;
    clsModel.schoolId = schoolId;

    if (req.body.hasOwnProperty("assignSections")) {
      clsModel.className = req.body.className;
      clsModel.assignedSections = req.body.assignSections;
    }

    var resultSet = await classesServ.createNewClass(clsModel);
    await Utils.retrunResponse(res, resultSet);
  }
),

router.patch(
  "/update/:classId",
  jwtAuthorise("classes", "write"),
  joiMiddleware(editAClass),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    clsModel = req.body;
    clsModel.schoolId = schoolId;
    clsModel.classId = req.params.classId;
    console.log("classId", clsModel.classId);
    var validate = false;
    if(req.body.validate) {
      validate = true
    } 

    var resultSet = await classesServ.updateAClass(clsModel, validate);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.patch(
  "/updateClassWithSections/:classId",
  jwtAuthorise("classes", "write"),
  joiMiddleware(editClassWithSections),
  async (req, res, next) => {
    const schoolId = req.user.schoolId;
    clsModel = req.body.class;
    console.log(clsModel);

    clsModel.schoolId = schoolId;
    console.log("object to update is:", clsModel);
    const assignedSections = req.body.assignedSections

    var resultSet = await classesServ.updateClassWithSections(clsModel, assignedSections);
    await Utils.retrunResponse(res, resultSet);
  }
);





 
module.exports = router;
