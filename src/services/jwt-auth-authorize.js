const path = require("path");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

const utils = require(path.resolve("src/config/utils"));
const APPCONS = require(path.resolve("appconstants"));
const users = require(path.resolve("src/modules/users/User"));
const userService = require(path.resolve("src/modules/users/services"));
const rolePermServ = require(path.resolve("src/modules/rolepermissions/services"));

const expiresIn = "1600m";
const jwtAuthenticate = () => {
  return async (req, res, next) => {
    console.log(req.body.loginId);

    ///check whether the user exists or not
    let user = await userService.getUserBy(req.body);

    if (user.message !== "Query Success") {
      return res.status(202).json(APPCONS.INVALIDUSERCREDENTIALS);
    } else {
      //generate token
      const [accessToken, refreshToken] = await Promise.all([
        generateToken(user, "accessToken"),
        generateToken(user, "refreshToken"),
      ]);

      await utils.setTokenParams(user.result.email, accessToken, refreshToken);

      //get the feature accessible for this user
      const userRolebasedPermissions = await utils.getrolebasedPermissions(
        user.result.roleId
      );
      res.json({
        result: "OK",
        resultCode: 200,
        loginSuccess: true,
        user: user.result,
        accessibleFeatures: userRolebasedPermissions,
        accessToken,
        refreshToken,
      });
      req.user = user.result;
      next();
    }
  };
};

async function generateToken(user, type) {
  if (type === "accessToken") {
    if (user.result) {
      return jwt.sign(
        {
          user: user.result.userName,
          email: user.result.email,
          userId: user.result.userId,
          roleId: user.result.roleId,
          schoolId: user.result.schoolId,
        },
        //process.env.ACCESS_TOKEN_SECRET, { expiresIn }
        APPCONS.ACCESS_TOKEN_SECRET,
        { expiresIn }
      );
    } else {
      // console.log("HEY", user);
      return jwt.sign(
        {
          user: user.user,
          email: user.email,
          userId: user.userId,
          roleId: user.roleId,
          schoolId: user.schoolId,
        },
        APPCONS.ACCESS_TOKEN_SECRET,
        { expiresIn }
      );
    }
  } else {
    if (user.result) {
      return jwt.sign(
        {
          user: user.result.userName,
          email: user.result.email,
          userId: user.result.userId,
          roleId: user.result.roleId,
          schoolId: user.result.schoolId,
        },
        APPCONS.REFRESH_TOKEN_SECRET
      );
    } else {
      return jwt.sign(
        {
          user: user.userName,
          email: user.email,
          userId: user.id,
          roleId: user.roleId,
          schoolId: user.schoolId,
        },
        APPCONS.REFRESH_TOKEN_SECRET
      );
    }
  }
}

const jwtAuthorise = (feature = null, functionality = null) => {
  return async (req, res, next) => {
    const refreshToken = req.headers["refreshtoken"];
    const token = req.headers["x-access-token"];
    // const token = authHeader && authHeader.split(" ")[1];
console.log('request headers', req.headers);
    console.log("refreshToken", refreshToken);

    if (!token) {
      return res.status(401).json(APPCONS.ACCESSTOKENREQUIRED);
    }

    jwt.verify(token, APPCONS.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (!err) {
        req.user = user;
        console.log("user object:");
        console.log(user);
        const rolebasedPermissions = await utils.getrolebasedPermissions(
          user.roleId
        );
        if (rolebasedPermissions) {
          if (
            !utils.checkFeatureAccessability(
              rolebasedPermissions,
              feature,
              functionality
            )
          ) {
            return res.status(403).json(APPCONS.ACCESSDENIED);
          }
        } else {
          return res.status(403).json(APPCONS.ACCESSDENIED);
        }
        next();
      } else {
        console.log("Invalid Access Token check the refresh token");
        jwt.verify(
          refreshToken,
          APPCONS.REFRESH_TOKEN_SECRET,
          async (err, user) => {
            if (!user) {
              return res.status(403).json(APPCONS.INVALIDACCESSTOKEN);
            }
            jwt.verify(
              refreshToken,
              APPCONS.REFRESH_TOKEN_SECRET,
              async (err, user) => {
                const accessToken = await generateToken(user, "accessToken");
                req.headers["x-access-token"] = "accessToken " + accessToken;
                console.log("x-access-token:" + req.headers["x-access-token"]);
                console.log("user data:", user);
                req.user = user;
                const rolebasedPermissions =
                  await utils.getrolebasedPermissions(user.roleId);
                if (rolebasedPermissions) {
                  if (
                    !utils.checkFeatureAccessability(
                      rolebasedPermissions,
                      feature,
                      functionality
                    )
                  ) {
                    return res.status(403).json(APPCONS.ACCESSDENIED);
                  }
                } else {
                  return res.status(403).json(APPCONS.ACCESSDENIED);
                }

                next();
              }
            );
          }
        );
      }
    });
  };
};

module.exports = {
  jwtAuthenticate,
  jwtAuthorise,
};
