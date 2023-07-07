// Importing the Express library
const express = require("express");

// Creating a router object using the Express library
const router = express.Router();

const { getAllRoles, getUsersWithRole } = require("../controllers/RoleController");

// Defining a route for handling GET requests to the root path ("/")
router.get("/", getAllRoles);

// Defining a route for handling GET requests to a specific role name ("/:roleName")
router.get("/:roleName", getUsersWithRole);

module.exports = router;
