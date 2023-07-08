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
// const { verifyJwtHeader, verifyJwtRole, handleErrors } = require("../middleware/auth_middleware");

router.get("/", getAllPosts);

// router.get("/user", verifyJwtHeader, verifyJwtRole, handleErrors, getSpecificUserPosts);

router.get("/user", getSpecificUserPosts);

router.get("/filter", filterPosts);

router.get("/:postId", getSpecificPost);

// router.post("/", verifyJwtHeader, verifyJwtRole, handleErrors, createPost);
router.post("/", createPost);

// router.delete("/:postId", verifyJwtHeader, verifyJwtRole, handleErrors, deletePost);
router.delete("/:postId", deletePost);

// router.put("/:postId", verifyJwtHeader, verifyJwtRole, handleErrors, updatePost);
router.put("/:postId", updatePost);

module.exports = router;
