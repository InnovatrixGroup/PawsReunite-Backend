// Importing the Express library
const express = require("express");
const { signup } = require("../controllers/UserController");
const { validateSignupInput, validateExistingUser } = require("../middleware/UserMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");
const { hashPassword } = require("../middleware/auth_middleware");

// Creating a router object using the Express library
const usersRouter = express.Router();

usersRouter.post(
  "/signup",
  validateSignupInput,
  validateExistingUser,
  errorCheck,
  hashPassword,
  signup
);

module.exports = usersRouter;
