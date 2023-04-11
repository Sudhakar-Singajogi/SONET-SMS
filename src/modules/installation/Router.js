const express = require("express");
const router = express.Router();
const path = require("path");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const Utils = require(path.resolve("src/config/utils"));

// const serv = require("./services");
// const installationEntity = require("./Installation");
// const { installationSchema } = require("./Schema");

const serv = require(path.resolve("src/modules/installation/services"));
const installationEntity = require(path.resolve("src/modules/installation/Installation"));
const { installationSchema } = require(path.resolve("src/modules/installation/Schema"));


router.post("/", joiMiddleware(installationSchema), async (req, res, next) => {
  const resultSet = await serv.doInstallation(req.body);
  await Utils.retrunResponse(res, resultSet);
});

module.exports = router;
