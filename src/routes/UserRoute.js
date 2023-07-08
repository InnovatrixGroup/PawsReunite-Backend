// Importing the Express library
const express = require("express");
const { signup } = require("../controllers/UserController");
const { validateSignupInput, validateExistingUser } = require("../middleware/UserMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");

// Creating a router object using the Express library
const usersRouter = express.Router();

usersRouter.post("/signup", validateSignupInput, validateExistingUser, errorCheck, signup);

module.exports = usersRouter;
