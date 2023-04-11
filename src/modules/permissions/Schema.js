const Joi = require("joi");
const path = require("path");
const utils = require(path.resolve("src/config/utils"));

const createAssignpermission = Joi.object().keys({
  schoolId: Joi.number().required().greater(0),
  permissions: Joi.array()
    .items(
      Joi.object().keys({
        name: Joi.string().required(),
        modules: Joi.array()
          .items(
            Joi.object()
              .keys({
                name: Joi.string().required(),
                moduleId: Joi.number().required().greater(0),
              })
              .required()
          )
          .required(),
        read: Joi.boolean().required(),
        write: Joi.boolean().required(),
        delete: Joi.boolean().required(),
      })
    )
    .required(),
});
const assignPermission = Joi.object().keys({
  schoolId: Joi.number().required().greater(0),
  assignPermissions: Joi.array().items(
    Joi.object().keys({
      permission: Joi.string().required(),
      modules: Joi.array()
        .items(
          Joi.object()
            .keys({
              name: Joi.string().required(),
              moduleId: Joi.number().required().greater(0),
            })
            .required()
        )
        .required(),
    })
  ),
});

const unAssignPermission = Joi.object().keys({
  schoolId: Joi.number().required().greater(0),
  unAassignPermissions: Joi.array().items(
    Joi.object().keys({
      permission: Joi.string().required(),
      modules: Joi.array()
        .items(
          Joi.object()
            .keys({
              name: Joi.string().required(),
              moduleId: Joi.number().required().greater(0),
            })
            .required()
        )
        .required(),
    })
  ),
});

const editAssignpermission = Joi.object().keys({
  schoolId: Joi.number().required().greater(0),
  assignedPermissions: Joi.array()
    .items(
      Joi.object().keys({
        permissionName: Joi.string().required(),
        newPermissionName: Joi.string().optional(),
        read: Joi.boolean().optional(),
        write: Joi.boolean().optional(),
        delete: Joi.boolean().optional(),
      })
    )
    .required(),
});

const deleteAssignpermissions = Joi.object().keys({
  schoolId: Joi.number().required().greater(0),
  permissions: Joi.array()
    .items(
      Joi.object().keys({
        permissionName: Joi.string().required(),
      })
    )
    .required(),
});
const schemas = {
  createAssignpermission,
  assignPermission,
  unAssignPermission,
  editAssignpermission,
  deleteAssignpermissions,
};

module.exports = schemas;
