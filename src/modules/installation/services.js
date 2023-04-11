const path = require("path");
const Installation = require(path.resolve("src/modules/installation/Installation"));
const Utils = require(path.resolve("src/config/utils"));

// const userModel = require("../users/User");
// const userService = require("../users/services");
// let schoolModel = require("../schools/School");
// const schoolService = require("../schools/services");

const userModel = require(path.resolve("src/modules/users/User"));
const userService = require(path.resolve("src/modules/users/services"));
let schoolModel = require(path.resolve("src/modules/schools/School"));
const schoolService = require(path.resolve("src/modules/schools/services"));

const md5 = require("md5");
const errHandler = (err) => {
  console.log("Error:", err);
};

module.exports = {
  doInstallation: async (reqBody) => {
    //check whether any user with this email address exists
    const userByEmail = await userService.getNumberOfUserByEmail(reqBody.email);

    if (userByEmail > 0) {
      return await Utils.returnResult(
        "Installation",
        false,
        "Email already exists"
      );
    }

    console.log("reqBody", reqBody);

    let password = md5(reqBody.password);
    delete reqBody.password;

    //prepare School entity
    schoolModel = reqBody;

    const resSet = await schoolService.createSchool(schoolModel);

    if (!resSet) {
      return await Utils.returnResult(
        "Installation",
        false,
        "SchoolIdentity or email already exists"
      );
    }

    //prepare User entity

    userModel.userName = resSet.primaryContactPerson;
    userModel.email = resSet.email;
    userModel.password = password;
    userModel.schoolId = resSet.schoolId;
    userModel.roleId = 1;

    const userResSet = await userService.createUser(userModel);

    if (!userResSet) {
      return await Utils.returnResult(
        "Installation",
        false,
        "Email already exists"
      );
    } else {
      return await Utils.returnResult("Installation", userResSet);
    }
  },
};
