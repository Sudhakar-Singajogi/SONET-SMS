var express = require("express");
var router = express.Router();
const contactus = require("./modules/Contactus/Router");
app.use("/contactus", contactus);
module.exports = router;
