const path = require("path");
const Utils = require(path.resolve("src/config/utils"));
// const featuresmodel = require("./features");
const featuresmodel = require(path.resolve("src/modules/features/features"));
const sequelize = require(path.resolve("src/dbconn/connection"));

async function getTotalRows(cond) {
  try {
    const totalFeatures = await featuresmodel.count({
      where: cond 
    });
    return totalFeatures;
  } catch (err) {
    return 0;
  }
} 
module.exports = {
  getfeatures: async (reqBody) => {
    var totalResults = await getTotalRows({ status:'1' });
    console.log('totalResults:', totalResults)
    totalResults = parseInt(totalResults);

    const offset = reqBody.offset;
    const limit = reqBody.limit;
    
    var offSet = await Utils.checkOffSetLimit(
      "modules",
      offset,
      limit,
      totalResults
    );
    if (typeof offSet != "number") {
      return await Utils.returnResult("modules", false, offSet[0], null);
    }
    const features = await featuresmodel.findAll({
      where: { status:'1' },
      offset: offSet,
      limit: limit != "" ? parseInt(limit) : 10,
      logging: (sql, queryObject) => {
        Utils.loglastExecuteQueryToWinston("get features", sql);
      },
    });

    if (features) {
      //get the total
      return await Utils.returnResult("Get all features", features, null, totalResults);
    } else {
      return await Utils.returnResult("Get all features", false, "No records found");
    }


    // const allFeature = await Utils.findAll({ model: featuresmodel, 'fetchRowCond': {'status':'1'} });
    // return await Utils.returnResult("Get all features", allFeature, null, allFeature.resultSet.length); 
  },
  getUnAssingedFeaturetoPermission: async (schoolId) => {
    let qry =
      "select moduleId, module  from modules where  modules.module not IN(SELECT modl.module from modules as modl left join permissions as per on per.moduleId=modl.moduleId  where per.schoolId=:schoolId)";
    await Utils.loglastExecuteQueryToWinston(
      "schools",
      qry.replace(":schoolId", schoolId)
    );

    return await sequelize
      .query(qry, {
        replacements: { schoolId: schoolId },
        type: sequelize.QueryTypes.SELECT,
      })
      .then((unAssignedFeatures) => {
        return {
          message: "Query Success",
          result: unAssignedFeatures,
          totalRows: unAssignedFeatures.length,
        };
      });
  },
};
