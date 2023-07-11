const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getSpecificPost,
  getSpecificUserPosts,
  updatePost,
  createPost,
  deletePost,
  filterPosts
} = require("../controllers/PostController");

const { upload } = require("../middleware/image_upload_aws");
const { verifyJwtAndRefresh, onlyAllowAdmins } = require("../middleware/AuthMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");
const { validateTitleLength } = require("../middleware/PostMiddleware");

router.get("/", getAllPosts);

router.get("/user", verifyJwtAndRefresh, errorCheck, getSpecificUserPosts);

router.get("/filter", filterPosts);

router.get("/:postId", verifyJwtAndRefresh, errorCheck, getSpecificPost);

router.post(
  "/",
  upload.single("photos"),
  verifyJwtAndRefresh,
  validateTitleLength,
  errorCheck,
  createPost
);

router.delete("/:postId", verifyJwtAndRefresh, errorCheck, deletePost);

router.put("/:postId", verifyJwtAndRefresh, validateTitleLength, errorCheck, updatePost);

module.exports = router;
