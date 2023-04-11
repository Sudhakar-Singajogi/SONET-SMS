const express = require("express");
const router = express.Router();
const path = require("path");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const Utils = require(path.resolve("src/config/utils"));
const { schoolSchema } = require(path.resolve("src/modules/schools/Schema"));

router.get("/", async (req, res, next) => {
  console.log("hey will fetch schools for you");
});

module.exports = router;
