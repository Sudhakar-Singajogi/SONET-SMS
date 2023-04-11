const Joi = require("joi");
const createNewClass = Joi.object().keys({
  className: Joi.string().required(),
  assignSections: Joi.array()
    .items(
      Joi.object().keys({
        sectionId: Joi.number().required(),
        sectionName: Joi.string().required(),
      })
    ).optional(),
});

const editAClass = Joi.object().keys({
  classId:Joi.number().optional(),
  className: Joi.string().optional(),
  status: Joi.string().optional(),
  validate: Joi.boolean().optional()
});

const editClassWithSections = Joi.object().keys({
  class:Joi.object().keys({
        classId: Joi.number().optional(),
        className: Joi.string().required(),
      }).required(),
  assignedSections: Joi.array()
    .items(
      Joi.object().keys({
        sectionId: Joi.number().required(),
        sectionName: Joi.string().required(),
      })
    ).optional(),
});

const schemas = {
  createNewClass,
  editAClass,
  editClassWithSections
};
module.exports = schemas;
