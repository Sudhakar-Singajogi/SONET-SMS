const express = require("express");
const router = express.Router();
const path = require("path");
const Utils = require(path.resolve("src/config/utils"));

router.get("/", async (req, res, next) => {
  var resultSet = {
    message: "Success",
    result: { value: "Welcome to Sonet-Node-App-KickStart" },
  };
  await Utils.retrunResponse(res, resultSet);
});

module.exports = router;
