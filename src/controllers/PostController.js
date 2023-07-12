const { Post } = require("../models/PostModel");

const getAllPosts = async (request, response) => {
  try {
    let allPosts;
    if (request.query.postId) {
      const postId = request.query.postId;
      allPosts = await Post.findById(postId).exec();
      if (!allPosts) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }
    } else {
      const filters = {};
      for (const queryParam in request.query) {
        filters[queryParam] = request.query[queryParam];
      }
      console.log(filters);
      allPosts = await Post.find(filters).exec();
    }
    response.json({
      data: allPosts
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

const getSpecificUserPosts = async (request, response) => {
  try {
    const allPosts = await Post.find({ userId: request.headers.userId }).exec();
    response.json({
      data: allPosts
    });
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

const { uploadFilesToS3 } = require("../middleware/image_upload_aws");

const createPost = async (request, response) => {
  try {
    const files = request.files;
    const photos = await uploadFilesToS3(files);
    const newPost = new Post({
      title: request.body.title,
      species: request.body.species,
      breed: request.body.breed,
      color: request.body.color,
      description: request.body.description,
      photos: photos,
      suburb: request.body.suburb,
      contactInfo: request.body.contactInfo,
      status: request.body.status,
      userId: request.headers.userId
    });

    const savedPost = await newPost.save();
    response.json({
      data: savedPost
    });
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

const deletePost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.postId).exec();

    // only user who created the post or admin can delete the post
    // user equals to find if the user is the same as the one who created the post
    // can not use === because you can not compare two objects, they are always different
    if (post.userId.equals(request.headers.userId) || request.headers.role == "admin") {
      const deletedPost = await Post.findByIdAndDelete(request.params.postId).exec();
      response.json({
        data: deletedPost
      });
    } else {
      throw new Error("You are not authorized to delete this post.");
    }
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

const updatePost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.postId).exec();
    if (!post) {
      throw new Error("Post not found");
    }
    if (!post.userId.equals(request.headers.userId)) {
      throw new Error("You are not authorized to update this post.");
    } else {
      const updatedData = {
        title: request.body.title || post.title,
        species: request.body.species || post.species,
        breed: request.body.breed || post.breed,
        color: request.body.color || post.color,
        description: request.body.description || post.description,
        suburb: request.body.suburb || post.suburb,
        contactInfo: request.body.contactInfo || post.contactInfo,
        status: post.status
      };

      const updatedPost = await Post.findByIdAndUpdate(request.params.postId, updatedData, {
        new: true
      }).exec();
      response.json({
        data: updatedPost
      });
    }
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

// filter
const filterPosts = async (request, response) => {
  try {
    const allStatus = await Post.distinct(request.query.status).exec();
    response.json({
      data: allStatus
    });
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

module.exports = {
  getAllPosts,
  getSpecificUserPosts,
  createPost,
  deletePost,
  updatePost,
  filterPosts
};
