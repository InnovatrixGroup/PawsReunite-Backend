const express = require("express");
const router = express.Router();
const { getAllRoles, getUsersWithRole } = require("../controllers/RoleController")

router.get("/", getAllRoles);

router.get("/:roleName", getUsersWithRole)

module.exports = router