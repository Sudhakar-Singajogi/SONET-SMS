const express = require("express");
const router = express.Router();
const path = require("path");

const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const Utils = require(path.resolve("src/config/utils"));

// const perServ = require("./services");
// const { jwtAuthorise } = require("../../services/jwt-auth-authorize");

const perServ = require(path.resolve("src/modules/permissions/services"));
const { jwtAuthorise } = require(path.resolve("src/services/jwt-auth-authorize"));

const {
  createAssignpermission,
  assignPermission,
  unAssignPermission,
  editAssignpermission,
  deleteAssignpermissions,
} = require("./Schema");

const assignSubSer = require("../assignedsubjects/services");

router.get("/", jwtAuthorise("permissions", "read"), async (req, res) => {
  const schoolId = req.user.schoolId;
  var resultSet = await perServ.getAssignedpermissions(schoolId);
  await Utils.retrunResponse(res, resultSet);
});

router.post(
  "/createAssignpermission",
  jwtAuthorise("permissions", "write"),
  joiMiddleware(createAssignpermission, "createAssignpermission"),
  async (req, res, next) => {
    var resultSet = await perServ.createAssignpermission(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.post(
  "/assignPermissions",
  jwtAuthorise("permissions", "write"),
  joiMiddleware(assignPermission, "assignPermission"),
  async (req, res, next) => {
    var resultSet = await perServ.assignFeatures(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.post(
  "/unAassignPermissions",
  jwtAuthorise("permissions", "delete"),
  joiMiddleware(unAssignPermission, "unAssignPermission"),
  async (req, res, next) => {
    var resultSet = await perServ.unAssignPermissionFeatures(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.patch(
  "/editAassignedPermissions",
  jwtAuthorise("permissions", "write"),
  joiMiddleware(editAssignpermission, "editAssignpermission"),
  async (req, res, next) => {
    var resultSet = await perServ.editAssignpermission(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.delete(
  "/",
  jwtAuthorise("permissions", "delete"),
  joiMiddleware(deleteAssignpermissions, "editAssignpermission"),
  async (req, res) => {
    var resultSet = await perServ.deleteAssignpermissions(req.body);
    await Utils.retrunResponse(res, resultSet);
  }
);

module.exports = router;
