const path = require("path");
const Utils = require(path.resolve("src/config/utils"));

// const perModel = require("./permissions");
// const featuresModel = require("../features/features");
// const featuresServ = require("../features/services");
// const featuresmodel = require("../features/features");
// const blogic = require("../../config/businessLogic");
// const schModel = require("../schools/School");
// const assignedroles = require("../../modules/rolepermissions/rolepermissions");


const perModel = require(path.resolve("src/modules/permissions/permissions"));
const featuresModel = require(path.resolve("src/modules/features/features"));
const featuresServ = require(path.resolve("src/modules/features/services"));
const featuresmodel = require(path.resolve("src/modules/features/features"));
const blogic = require(path.resolve("src/config/businessLogic"));
const schModel = require(path.resolve("src/modules/schools/School"));
const assignedroles = require(path.resolve("src/modules/rolepermissions/rolepermissions"));

// //define associations to fetch data
perModel.belongsTo(featuresModel, {
  through: "moduleId",
  foreignKey: "moduleId",
});

// //define associations to fetch data
perModel.belongsTo(schModel, {
  through: "schoolId",
  foreignKey: "schoolId",
});

const FeatureAssoc = {
  model: featuresModel,
  attributes: {
    exclude: ["status", "createdAt", "updatedAt"],
  },
};

const exc_schoolAssoc = {
  model: schModel,
  attributes: {
    exclude: [
      "schoolId",
      "email",
      "primaryContactPerson",
      "contactNumber",
      "status",
      "createdAt",
      "updatedAt",
    ],
  },
};

function appendObjTo(thatArray, newObj) {
  const frozenObj = Object.freeze(newObj);
  return Object.freeze(thatArray.push(frozenObj));
}

module.exports = {
  getAssignedpermissions: async (schoolId) => {
    // return await featuresServ.getUnAssingedFeaturetoPermission(schoolId);

    let assignedPermissions = await Utils.fetchRows({
      model: perModel,
      fetchRowsCond: { schoolId },
      excludeFields: ["createdAt", "updatedAt"],
      includes: [FeatureAssoc, exc_schoolAssoc],
      orderBy: ["permissionId", "DESC"],
    });

    if (assignedPermissions) {
      var respObj = await Utils.returnResult(
        "Fetch permisions",
        assignedPermissions.resultSet,
        null,
        assignedPermissions.resultSet.length
      );
      return await blogic.prepareModulePermissions(respObj);
    } else {
      await Utils.returnResult("Fetch permisions", [], false);
    }
  },
  createAssignpermission: async (reqBody) => {
    var errors = [];
    try {
      reqBody.model = perModel;
      reqBody.featuresmodel = featuresmodel;

      let schoolId = reqBody.schoolId;
      let insertPermissions = [];
      let resp = await blogic.validateCreateAssignpermission(reqBody);

      if (resp.errors.length > 0) {
        errors.push(resp.errors);
      } else {
        insertPermissions = resp.insertPermissions;
      }
      if (errors.length > 0) {
        return await Utils.returnResult("Create and assign permissions", {
          ValidationErrors: errors,
        });
      } else {
        const paramObj = {
          model: perModel,
          data: insertPermissions,
          insertUpdate: "insert",
          updateOnDuplicateFields: [],
          fetchRowsCond: { schoolId },
          offset: 0,
          limit: 100,
          msg: "Create and assign permissions",
          excludeFields: ["createdAt", "updatedAt"],
          feature: "CreateAssignPermisisons",
          includes: [FeatureAssoc, exc_schoolAssoc],
          orderBy: ["permissionId", "desc"],
        };

        const resp = await Utils.bulkInsertUpdate(paramObj);
        if (resp) {
          var respObj = await Utils.returnResult(
            "Create and Assign Permissions",
            resp.resultSet,
            null,
            resp.resultSet.length
          );
          return await blogic.prepareModulePermissions(respObj);
        } else {
          await Utils.returnResult("Create and Assign Permissions", [], false);
        }
      }
    } catch (err) {
      console.log("errors:", err);
      return await Utils.catchError("Create and assign permissions", err);
    }
  },
  assignFeatures: async (reqBody) => {
    var errors = [];
    try {
      reqBody.model = perModel;
      reqBody.featuresmodel = featuresmodel;

      let schoolId = reqBody.schoolId;
      let insertPermissions = [];
      let resp = await blogic.validateAssignPermissions(reqBody);

      if (resp.errors.length > 0) {
        errors.push(resp.errors);
      } else {
        insertPermissions = resp.insertPermissions;
      }
      if (errors.length > 0) {
        return await Utils.returnResult("Create and assign permissions", {
          ValidationErrors: errors,
        });
      } else {
        const paramObj = {
          model: perModel,
          data: insertPermissions,
          insertUpdate: "insert",
          updateOnDuplicateFields: [],
          fetchRowsCond: { schoolId },
          offset: 0,
          limit: 100,
          msg: "Assign permissions to modules",
          excludeFields: ["createdAt", "updatedAt"],
          feature: "AssignPermisisons",
          includes: [FeatureAssoc, exc_schoolAssoc],
          orderBy: ["permissionId", "desc"],
        };

        const resp = await Utils.bulkInsertUpdate(paramObj);
        if (resp) {
          var respObj = await Utils.returnResult(
            "Assign permissions to modules",
            resp.resultSet,
            null,
            resp.resultSet.length
          );
          return await blogic.prepareModulePermissions(respObj);
        } else {
          await Utils.returnResult("Assign Permissions", [], false);
        }
      }
    } catch (err) {
      console.log("errors:", err);
      return await Utils.catchError("Assign permissions", err);
    }
  },
  unAssignPermissionFeatures: async (reqBody) => {
    var errors = [];
    try {
      const unAassignPermissions = reqBody.unAassignPermissions;

      reqBody.model = perModel;
      reqBody.featuresmodel = featuresmodel;
      const schoolId = reqBody.schoolId;

      for (let index in unAassignPermissions) {
        let unAassignPermission = unAassignPermissions[index];
        let modules = unAassignPermission.modules;
        let name = unAassignPermission.permission;

        for (let j in modules) {
          let moduleId = modules[j].moduleId;
          let moduleName = modules[j].name;

          let cond = {
            schoolId,
            name,
            moduleId,
          };

          let exists = await Utils.checkRowExists(
            cond,
            perModel,
            `check whether the module(${moduleName}) assigned to ${name} permission`
          );
          const excludeFields = [
            "schoolId",
            "name",
            "moduleId",
            "read",
            "write",
            "delete",
            "createdAt",
            "updatedAt",
          ];
          if (exists) {
            //get the permissionId
            let permission = await Utils.getAField(
              cond,
              "permissionId",
              perModel,
              "permissions",
              excludeFields
            );
            let permissionId = permission.permissionId;

            await perModel
              .destroy({
                where: {
                  permissionId,
                },
              })
              .then(async () => {
                await Utils.logToWinston(
                  `Successfully unassigned the module(${moduleName}) assigned to ${name} permission `
                );
                //unassign permissions to a role
                await assignedroles.destroy({
                  where: {
                    permissionId,
                  },
                });
              })
              .catch(async (err) => {
                await Utils.logToWinston(
                  "Failed in unassigning of the permissions due to:",
                  err
                );
                return await Utils.returnResult("Un assign permission", {
                  ValidationErrors: `Failed in unassigning the module(${moduleName}) assigned to ${name} permission, kindly contact administrator`,
                });
              });
          }
        }

        var paramobj = {
          model: perModel,
          fetchRowConds: { schoolId },
          offset: 0,
          limit: 100,
          excludeFields: ["createdAt", "updatedAt"],
          feature: "GetPermissionsAssigned",
          includes: [FeatureAssoc, exc_schoolAssoc],
          orderBy: ["permissionId", "desc"],
        };

        assignedPermissions = await Utils.fetchRows(paramobj);

        if (assignedPermissions) {
          var respObj = await Utils.returnResult(
            "Unassign permissions to modules",
            assignedPermissions.resultSet,
            null,
            assignedPermissions.resultSet.length
          );
          return await blogic.prepareModulePermissions(respObj);
        } else {
          await Utils.returnResult("Unassign Permissions", [], false);
        }
      }
    } catch (err) {
      console.log("errors:", err);
      return await Utils.catchError("Assign permissions", err);
    }
  },
  editAssignpermission: async (reqBody) => {
    var errors = [];

    var editAssignpermissions = reqBody.assignedPermissions;
    reqBody.model = perModel;

    let resp = await blogic.editAssignpermissions(reqBody);

    if (resp.errors.length > 0) {
      errors.push(resp.errors);
      return await Utils.returnResult("Update assigned permissions", {
        ValidationErrors: errors,
      });
    } else {
      let setData = resp.insertPermissions;
      let fieldsToUpdate = await Utils.getTableColumns(
        perModel,
        "include",
        true
      );

      try {
        const paramObj = {
          model: perModel,
          data: setData,
          insertUpdate: "update",
          updateOnDuplicateFields: fieldsToUpdate,
          fetchRowsCond: {
            schoolId: reqBody.schoolId,
          },
          offset: 0,
          limit: 100,
          msg: "Update assigned permission/s",
          excludeFields: ["createdAt", "updatedAt"],
          feature: "students",
          includes: [FeatureAssoc, exc_schoolAssoc],
          orderBy: ["updatedAt", "DESC"],
        };

        // bulk update the permission/s
        const resp = await Utils.bulkInsertUpdate(paramObj);

        if (resp) {
          var respObj = await Utils.returnResult(
            "Fecth Permissions after update",
            resp.resultSet,
            null,
            resp.resultSet.length
          );
          return await blogic.prepareModulePermissions(respObj);
        } else {
          await Utils.returnResult("Fecth Permissions after update", [], false);
        }
      } catch (err) {
        console.log("syntax:", err);
        return await Utils.catchError("Error in updating permissions", err);
      }
    }
  },
  deleteAssignpermissions: async (reqBody) => {
    reqBody.assignedroles = assignedroles;
    reqBody.model = perModel;

    let resp = await blogic.deletePermissons(reqBody);
    if (resp.errors.length > 0) {
      return await Utils.returnResult("Delete assigned permissions", {
        ValidationErrors: resp.errors,
      });
    } else {
      let assignedPermissions = await Utils.fetchRows({
        model: perModel,
        fetchRowsCond: {
          schoolId: reqBody.schoolId,
        },
        excludeFields: ["createdAt", "updatedAt"],
        includes: [FeatureAssoc, exc_schoolAssoc],
        orderBy: ["updatedAt", "DESC"],
      });

      if (assignedPermissions) {
        var respObj = await Utils.returnResult(
          "Fetch permisions after deleting",
          assignedPermissions.resultSet,
          null,
          assignedPermissions.resultSet.length
        );
        return await blogic.prepareModulePermissions(respObj);
      } else {
        await Utils.returnResult("Fetch permisions after deleting", [], false);
      }
    }
  },
};
