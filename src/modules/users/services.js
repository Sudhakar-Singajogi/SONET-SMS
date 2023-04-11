const path = require("path");
const Utils = require(path.resolve("src/config/utils"));

// const userModel = require("./User");
// const User = require("./User");
// const School = require("../schools/School");
// const Role = require("../roles/Role");

const userModel = require(path.resolve("src/modules/users/User"));
const User = require(path.resolve("src/modules/users/User"));
const School = require(path.resolve("src/modules/schools/School"));
const Role = require(path.resolve("src/modules/roles/Role"));

const md5 = require("md5");

const errHandler = (err) => {
  console.log("Error:", err);
};

//define associations to fetch data
User.belongsTo(School, {
  through: "schoolId",
  foreignKey: "schoolId",
});

// User.hasMany(User);
User.belongsTo(Role, {
  through: "roleId",
  foreignKey: "roleId",
});

const SchoolAssoc = {
  model: School,
  attributes: {
    exclude: [
      "schoolId",
      "primaryEmail",
      "contactNumber",
      "primaryContactPerson",
      "status",
      "createdAt",
      "updatedAt",
    ],
  },
};

const RoleAssoc = {
  model: Role,
  attributes: {
    exclude: ["roleId", "status", "createdAt", "updatedAt"],
  },
};

async function getuserCountByEmail(email) {
  const totalUsers = userModel
    .count({
      where: {
        email: email,
      },
      logging: (sql, queryObject) => {
        Utils.loglastExecuteQueryToWinston("Get toal users on this email", sql);
      },
    })
    .catch((err) => {
      return Utils.catchError("user", err);
    });

  return totalUsers;
}

module.exports = {
  createUser: async (userBody) => {
    const userExists = await getuserCountByEmail(userBody.email);

    if (userExists > 0) {
      return false;
    }

    const user = await userModel
      .create({
        ...userBody,
        logging: (sql, queryObject) => {
          Utils.loglastExecuteQueryToWinston("create a new user", sql);
        },
      })
      .catch(errHandler);

    if (user) {
      const rsSet = await userModel.findByPk(user.userId, {
        include: [SchoolAssoc, RoleAssoc],
        attributes: {
          exclude: [
            "userId",
            "roleId",
            "schoolId",
            "password",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      });
      if (rsSet) {
        return rsSet;
      }
    }
  },
  getNumberOfUserByEmail: async (email) => {
    const totalUsers = await getuserCountByEmail(email);
    return totalUsers;
  },

  getUserBy: async (reqBody) => {
    const password = md5(reqBody.password);
    const user = await User.findOne({
      where: { email: reqBody.loginId, password: password, status: 1 },
      include: [SchoolAssoc, RoleAssoc],
      attributes: {
        exclude: ["password", "status", "createdAt", "updatedAt"],
      },
    });
    return user
      ? await Utils.returnResult("user", user)
      : await Utils.returnResult("user", user, "No record found");
  },
  getUsers: async (schoolId) => {
    const user = await User.findAll({
      where: { schoolId: schoolId, status: 1 },
      attributes: {
        exclude: [
          "roleId",
          "schoolId",
          "password",
          "status",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    return user
      ? await Utils.returnResult("user", user)
      : await Utils.returnResult("user", user, "No record found");
  },
};
