// Importing the Express library
const express = require("express");

// Creating a router object using the Express library
const router = express.Router();

const {
  getAllNotifications,
  createNotification
} = require("../controllers/NotificationController");
const { verifyJwtAndRefresh, onlyAllowAdmins } = require("../middleware/AuthMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");

// Defining a route for handling GET requests to the root path ("/")
router.get("/", verifyJwtAndRefresh, errorCheck, getAllNotifications);
router.post("/", createNotification);

module.exports = router;
