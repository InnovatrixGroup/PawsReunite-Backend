const express = require("express");
const router = express.Router();

const {
  getAllComments,
  getSpecificComment,
  createComment,
  deleteComment
} = require("../controllers/CommentController");
const { verifyJwtAndRefresh, onlyAllowAdmins } = require("../middleware/AuthMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");

router.get("/", getAllComments);

router.get("/:commentId", getSpecificComment);

router.post("/:postId", verifyJwtAndRefresh, errorCheck, createComment);

router.delete("/:commentId", verifyJwtAndRefresh, errorCheck, deleteComment);

module.exports = router;
