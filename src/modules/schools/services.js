const path = require("path");
const schoolModel = require(path.resolve("src/modules/schools/School"));
const Utils = require(path.resolve("src/config/utils"));
const { Op } = require("sequelize");

module.exports = {
  createSchool: async (schoolBody) => {
    const { identity, email } = schoolBody;

    const schoolExists = await schoolModel
      .count({
        where: {
          [Op.or]: [{ identity }, { email }],
        },
        logging: (sql, queryObject) => {
          Utils.loglastExecuteQueryToWinston("School Exists", sql);
        },
      })
      .catch((err) => {
        return Utils.catchError("School", err);
      });

    if (schoolExists > 0) {
      return false;
    }

    try {
      return await schoolModel.create({ ...schoolBody });
    } catch (err) {
      return Utils.catchError("School Installation", err);
    }
  },
};
