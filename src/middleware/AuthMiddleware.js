const jwt = require("jsonwebtoken");
const { User } = require("../models/UserModel");
const { Role } = require("../models/RoleModel");
const { verifyUserJWT, decryptString } = require("../services/auth_services");

// Make sure the JWT available in the headers is valid,
// and refresh it to keep the JWT usable for longer.
const verifyJwtHeader = async (req, res, next) => {
  try {
    let rawJwtHeader = req.headers.authorization;

    let jwtRefresh = await verifyUserJWT(rawJwtHeader);

    req.headers.authorization = jwtRefresh;

    next();
  } catch (error) {
    req.errors.push(error.message);
  }
};

const verifyJwtRole = async (request, response, next) => {
  try {
    // Verify the JWT in the headers
    let userJwtVerified = jwt.verify(request.headers.authorization, process.env.JWT_SECRET, {
      complete: true
    });
    let decryptedJwtPayload = decryptString(userJwtVerified.payload.data);
    let userData = JSON.parse(decryptedJwtPayload);

    // Find the user mentioned in the JWT.
    let targetUser = await User.findById(userData.userId).exec();
    if (!targetUser) {
      throw new Error({ message: "User not found." });
    }
    let targetRole = await Role.findById(targetUser.roleId).exec();

    // Assign the user's role and ID to the request headers
    request.headers.userRole = targetRole.name;
    request.headers.userId = targetUser._id;
    next();
  } catch (error) {
    request.errors.push(error.message);
  }
};

const onlyAllowAdmins = async (request, response, next) => {
  try {
    if (request.headers.userRole !== "admin") {
      throw new Error({ message: "You are not authorized to perform this action." });
    }
    next();
  } catch (error) {
    request.errors.push(error.message);
  }
};

module.exports = { verifyJwtHeader, verifyJwtRole, onlyAllowAdmins };
