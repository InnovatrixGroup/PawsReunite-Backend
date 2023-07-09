// Importing the Express library
const express = require("express");
const { signup, signin, editProfile } = require("../controllers/UserController");
const { validateSignupInput, validateExistingUser } = require("../middleware/UserMiddleware");
const { verifyJwtHeader, verifyJwtRole } = require("../middleware/AuthMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");

// Creating a router object using the Express library
const usersRouter = express.Router();

usersRouter.post("/signup", validateSignupInput, validateExistingUser, signup, errorCheck);

usersRouter.post("/signin", signin);

// not quite right yet, need to update the middlewares
usersRouter.put("/", verifyJwtHeader, errorCheck, editProfile);

module.exports = usersRouter;
