const Joi = require("joi");
const createSection = Joi.object().keys({
  sections: Joi.array()
    .items(
      Joi.object().keys({
        sectionName: Joi.string().required(),
        capacity: Joi.number().required()
      })
    )
    .required(),
});

const editASection = Joi.object().keys({
  sections: Joi.array().items(
    Joi.object()
      .keys({
        sectionId: Joi.number().required(),
        sectionName: Joi.string().trim().required(),
        capacity: Joi.number().optional()
      })
      .optional()
  ),
});

const assignSections = Joi.object().keys({
  classId: Joi.number().required(),
  assignedSections: Joi.array().items(
    Joi.object()
      .keys({
        sectionId: Joi.number().required(),
        sectionName: Joi.string().trim().required(),
      })
      .required()
  ),
});

const unAssignSections = Joi.object().keys({
  classId: Joi.number().required(),
  assignedSections: Joi.array().items(
    Joi.object()
      .keys({
        sectionId: Joi.number().required(),
        sectionName: Joi.string().trim().required(),
      })
      .required()
  ),
});

const schemas = {
  createSection,
  editASection,
  assignSections,
  unAssignSections,
};
module.exports = schemas;
