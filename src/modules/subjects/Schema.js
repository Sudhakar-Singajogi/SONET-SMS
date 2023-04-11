const Joi = require("joi");
const path = require("path");
const utils = require(path.resolve("src/config/utils"));

const createAssign = Joi.object().keys({
  schoolId: Joi.number().required().greater(0),
  subjects: Joi.array()
    .items(
      Joi.object()
        .keys({
          subjectName: Joi.string().required(),
          type: Joi.string().required(),
          passMarks: Joi.number().precision(2).required(),
          totalMarks: Joi.number().precision(2).required(),
        })
        .required()
    )
    .required(),
  assignedClasses: Joi.array()
    .items(
      Joi.object().keys({
        className: Joi.string().required(),
        classId: Joi.number().required().greater(0),
      })
    )
    .optional(),
});

const assignSubjectToClass = Joi.object().keys({
  assignSubjects: Joi.array()
    .items(
      Joi.object()
        .keys({
          subjectName: Joi.string().required(),
          subjectId: Joi.number().required(),
          classId: Joi.number().required().greater(0),
          className: Joi.string().required(),
        })
        .required()
    )
    .required(),
});

const editSubject = Joi.object().keys({
  updateSubjects: Joi.array().items(
    Joi.object().keys({
      subjectId: Joi.number().required(),
      subjectName: Joi.string().optional(),
      type: Joi.string().optional(),
      passMarks: Joi.number().precision(2).optional(),
      totalMarks: Joi.number().precision(2).optional(),
      status: Joi.string().optional(),
    })
  ),
});

const updateSubject = Joi.object().keys({
  schoolId: Joi.number().required().greater(0),
  subjects: Joi.array().items(
      Joi.object().keys({
        subjectId: Joi.number().required(),
        subjectName: Joi.string().optional(),
        type: Joi.string().optional(),
        passMarks: Joi.number().precision(2).optional(),
        totalMarks: Joi.number().precision(2).optional(),
        status: Joi.string().optional(),
      })
    ).optional(),
    assignedClasses: Joi.array()
    .items(
      Joi.object().keys({
        assignedId:Joi.number().required().greater(0).optional(),
        className: Joi.string().required(),
        classId: Joi.number().required().greater(0).required(),
      })
    ).optional()
});

const schemas = {
  createAssign,
  assignSubjectToClass,
  editSubject,
  updateSubject
};
module.exports = schemas;
