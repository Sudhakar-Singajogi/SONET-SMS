const Joi = require("joi");
const schoolSchema = Joi.object().keys({
  name: Joi.string().required(),
  identity: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  contactNumber: Joi.number().min(10).required(),
});

const schemas = {
  schoolSchema,
};
module.exports = schemas;
