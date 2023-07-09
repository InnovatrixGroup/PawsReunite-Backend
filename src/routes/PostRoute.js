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

router.get("/", getAllPosts);

router.get("/user/:userId", getSpecificUserPosts);

router.get("/filter", filterPosts);

router.get("/:postId", getSpecificPost);

// router.post("/", verifyJwtHeader, verifyJwtRole, handleErrors, createPost);
router.post("/:userId", upload.single("image"), createPost);

// router.delete("/:postId", verifyJwtHeader, verifyJwtRole, handleErrors, deletePost);
router.delete("/:postId", deletePost);

// router.put("/:postId", verifyJwtHeader, verifyJwtRole, handleErrors, updatePost);
router.put("/:postId", updatePost);

module.exports = router;
