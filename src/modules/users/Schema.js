const Joi = require("joi");
const validateUserLogin = Joi.object().keys({
  loginId: Joi.string().email().required(),
  password: Joi.string().required(),
});

const schemas = {
  validateUserLogin,
};
module.exports = schemas;
