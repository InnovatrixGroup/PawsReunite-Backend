const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");
const { Role } = require("../models/RoleModel");
const { verifyUserJWT, decryptString } = require("../services/auth_services");

// Make sure the JWT available in the headers is valid,
// and refresh it to keep the JWT usable for longer.
const verifyJwtAndRefresh = async (req, res, next) => {
  try {
    // Verify the JWT in the headers
    let rawJwtHeader = req.headers.authorization;
    let jwtToken = rawJwtHeader.split(" ")[1];

    // verify and refresh the JWT if valid
    let userJwtVerifiedResult = await verifyUserJWT(jwtToken);
    let { newJWT, targetUser } = userJwtVerifiedResult;
    req.headers.authorization = "Bearer " + newJWT;

    // Assign the user's role and ID to the request headers
    let targetRole = await Role.findById(targetUser.roleId).exec();
    req.headers.userRole = targetRole.name;
    req.headers.userId = targetUser._id;
    req.headers.user = targetUser;

    next();
  } catch (error) {
    req.errors.push(error.message);
    next();
  }
};

const onlyAllowAdmins = async (req, res, next) => {
  if (req.headers.userRole === "admin") {
    next();
  } else {
    req.errors.push("Unauthorized");
    next();
  }
};

module.exports = { verifyJwtAndRefresh, onlyAllowAdmins };
