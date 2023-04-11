const express = require("express");
const router = express.Router();
const path = require("path");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const Utils = require(path.resolve("src/config/utils"));

// const { installationSchema } = require("./Schema");

const {
  jwtAuthenticate,
  jwtAuthorise,
} = require(path.resolve("src/services/jwt-auth-authorize"));
const { validateUserLogin } =  require(path.resolve("src/modules/users/Schema"));
const userServ =  require(path.resolve("src/modules/users/services"));

router.get(
  "/school/:id",
  jwtAuthorise("schools", "read"),
  async (req, res, next) => {
    const schoolId = req.params.id;
    var resultSet = await userServ.getUsers(schoolId);
    await Utils.retrunResponse(res, resultSet);
  }
);

router.post(
  "/login",
  joiMiddleware(validateUserLogin),
  jwtAuthenticate(),
  async (req, res, next) => {}
);

module.exports = router;
