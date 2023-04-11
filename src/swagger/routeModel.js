const Joi = require("joi");
/**
 * File name for request and response model should be same as router file.
 * Define request model with there order in router js file.
 * For example first api in user router is create user so we define createUser schema with key 0.
 */
module.exports = {
  // Here 0 is the order of api in route file.
  0: {
    body: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      address: Joi.string().required(),
      contact: Joi.number().required(),
    },
    model: "createUser", // Name of the model
    group: "User", // Swagger tag for apis.
    description: "Create user and save details in database",
  },
  1: {
    query: {},
    path: {}, // Define for api path param here.
    header: {}, // Define if header required.
    group: "User",
    description: "Get All User",
  },
  2: {
    body: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      address: Joi.string().required(),
      contact: Joi.number().required(),
    },
    model: "updateUser",
    group: "User",
    description: "Update User",
  },
  3: {
    query: {},
    path: {
      userId: Joi.number().required(),
    }, // Define for api path param here.
    header: {}, // Define if header required.
    model: "getUserDetails",
    group: "User",
    description: "Get user details",
  },
  4: {
    excludeFromSwagger: false, // Make it true if need to exclude apis from swagger.
  },
};
