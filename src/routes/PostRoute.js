const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getSpecificUserPosts,
  updatePost,
  createPost,
  deletePost,
  filterPosts,
  getDistinctBreeds
} = require("../controllers/PostController");

const { upload } = require("../middleware/image_upload_aws");
const { verifyJwtAndRefresh, onlyAllowAdmins } = require("../middleware/AuthMiddleware");
const { errorCheck } = require("../middleware/ErrorMiddleware");
const { validateTitleLength } = require("../middleware/PostMiddleware");

router.get("/", getAllPosts);

router.get("/user", verifyJwtAndRefresh, errorCheck, getSpecificUserPosts);

router.get("/filter", filterPosts);

router.post(
  "/",
  upload.array("photos"),
  verifyJwtAndRefresh,
  validateTitleLength,
  errorCheck,
  createPost
);

router.delete("/:postId", verifyJwtAndRefresh, errorCheck, deletePost);

router.put(
  "/:postId",
  upload.array("photos"),
  verifyJwtAndRefresh,
  validateTitleLength,
  errorCheck,
  updatePost
);

router.get("/distinct-breeds", getDistinctBreeds);

module.exports = router;
