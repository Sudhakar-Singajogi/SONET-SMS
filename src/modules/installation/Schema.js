const Joi = require("joi");
const installationSchema = Joi.object().keys({
  identity: Joi.string().required(),
  schoolName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  contactNumber: Joi.number().min(10).required(),
  primaryContactPerson: Joi.string().min(3).required(),
});

const schemas = {
  installationSchema,
};
module.exports = schemas;
