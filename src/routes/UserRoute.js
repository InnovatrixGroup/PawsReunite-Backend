// Importing the Express library
const express = require("express");
const { signup, signin, editProfile, getAllUsers } = require("../controllers/UserController");
const {
  validateEmailAndPasswordInput,
  checkIfIsExistingUser
} = require("../middleware/UserMiddleware");
const { verifyJwtAndRefresh, onlyAllowAdmins } = require("../middleware/AuthMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");

// Creating a router object using the Express library
const usersRouter = express.Router();

usersRouter.post(
  "/signup",
  validateEmailAndPasswordInput,
  checkIfIsExistingUser,
  errorCheck,
  signup
);

usersRouter.post("/signin", signin);

usersRouter.put("/", verifyJwtAndRefresh, validateEmailAndPasswordInput, errorCheck, editProfile);

usersRouter.get("/all", verifyJwtAndRefresh, onlyAllowAdmins, errorCheck, getAllUsers);

module.exports = usersRouter;
