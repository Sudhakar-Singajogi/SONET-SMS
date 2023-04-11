const path = require("path");
const express = require("express");
const router = express.Router();
const { joiMiddleware, } = require(path.resolve("src/initializer/framework"));
const { jwtAuthorise } =  require(path.resolve("src/services/jwt-auth-authorize"));
const Utils = require(path.resolve("src/config/utils"));
const roleServices = require(path.resolve("src/modules/roles/services"));

router.get("/with-accounts", 
jwtAuthorise("roles", "read"),
async (req, res, next) => {
  
  return res.status(200).json({
    result: "OK",
    resultCode: 200,
    message: 'Query success',
    ValidationErrors: "",
    data: await roleServices.getRolesWithAccounts(),
    totalRows: 0,
  }); 
});


router.get("/user-roles-access?:roleName", 
jwtAuthorise("roles", "read"),
async (req, res, next) => {

  var roleName = 'all';

  if (req.query.roleName) {
    roleName = req.query.roleName
  }
  
  return res.status(200).json({
    result: "OK",
    resultCode: 200,
    message: 'Query success',
    ValidationErrors: "",
    data: await roleServices.getUserRolesWithAccess(roleName),
    totalRows: 0,
  }); 
});

module.exports = router;
