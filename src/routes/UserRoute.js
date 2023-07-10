// Importing the Express library
const express = require("express");
const {
  signup,
  signin,
  editProfile,
  getAllUsers,
  deleteUser,
  getAccountDetails
} = require("../controllers/UserController");
const {
  validateEmailAndPasswordInput,
  checkIfIsExistingUser
} = require("../middleware/UserMiddleware");
const { verifyJwtAndRefresh, onlyAllowAdmins } = require("../middleware/AuthMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");

// Creating a router object using the Express library
const usersRouter = express.Router();

// Creating a route for signing up a new user
usersRouter.post(
  "/signup",
  validateEmailAndPasswordInput,
  checkIfIsExistingUser,
  errorCheck,
  signup
);

// Creating a route for signing in an existing user
usersRouter.post("/signin", signin);

// Creating a route for getting all users, admin only
// Have to put this route before the route for getting a user's account details
usersRouter.get("/all", verifyJwtAndRefresh, onlyAllowAdmins, errorCheck, getAllUsers);

// Creating a route for getting a user's account details
usersRouter.get("/:userId", verifyJwtAndRefresh, errorCheck, getAccountDetails);

// Creating a route for editing a user's account details
usersRouter.put("/", verifyJwtAndRefresh, validateEmailAndPasswordInput, errorCheck, editProfile);

// Creating a route for deleting a user, admin only
usersRouter.delete("/:userId", verifyJwtAndRefresh, onlyAllowAdmins, errorCheck, deleteUser);

module.exports = usersRouter;
