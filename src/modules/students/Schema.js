const Joi = require("joi");
const path = require("path");
const utils = require(path.resolve("src/config/utils"));
const minYear = utils.getMinYear(3);
console.log("minYear:" + minYear);

const createStudent = Joi.object().keys({
  classId: Joi.number().required(),
  sectionId: Joi.number().required(),
  students: Joi.array()
    .items(
      Joi.object().keys({
        studentFirstName: Joi.string().required(),
        studentLastName: Joi.string().trim().required(),
        dob: Joi.date().max(minYear).required(),
        contactNumber: Joi.string().min(10).required(),
        academicYear: Joi.string().trim().optional(),
      })
    )
    .required(),
});

const editStudent = Joi.object().keys({
  classId: Joi.number().required(),
  sectionId: Joi.number().required(),
  students: Joi.array()
    .items(
      Joi.object().keys({
        studentId: Joi.number().required(),
        studentFirstName: Joi.string().optional(),
        studentLastName: Joi.string().trim().optional(),
        academicYear: Joi.string().trim().optional(),
        dob: Joi.date().max(minYear).optional(),
        bloodGroup: Joi.string().optional(),
        rollNumber: Joi.string().optional(),
        status: Joi.number().optional(),
        contactNumber: Joi.string().min(10).optional(),
      })
    )
    .required(),
});

const profilePicUpdate = Joi.object().keys({
  studentId: Joi.number().required(),
});

const schemas = {
  createStudent,
  editStudent,
  profilePicUpdate,
};
module.exports = schemas;
