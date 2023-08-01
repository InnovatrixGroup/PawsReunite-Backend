const { Post } = require("../models/PostModel");

// Async function to retrieve all posts based on query parameters or no params
const getAllPosts = async (request, response) => {
  try {
    let allPosts;
    // If postId is provided in the query, find a specific post by its ID
    if (request.query.postId) {
      const postId = request.query.postId;
      allPosts = await Post.findById(postId).exec();
      // if post not found, throw an error
      if (!allPosts) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }
    } else {
      // If no query parameters posrId is provided, find all posts based on other query parameters (filters)
      const filters = {};

      // Loop through all query parameters and add them to the filters object
      for (const queryParam in request.query) {
        filters[queryParam] = request.query[queryParam];
      }

      // Find posts based on the applied filters and sort them by createdAt in descending order
      allPosts = await Post.find(filters).sort({ createdAt: -1 }).exec();
    }
    response.json({
      data: allPosts
    });
  } catch (error) {
    // If error is thrown, send error message and status code
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

// Get specific user's posts
const getSpecificUserPosts = async (request, response) => {
  try {
    // Find all posts associated with the provided userId in the request headers
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

// Create a new post
const createPost = async (request, response) => {
  try {
    // Get files from the request
    const files = request.files;
    // Upload files to AWS S3 bucket and get the URLs
    const photos = await uploadFilesToS3(files);

    // Create a new post with the provided data
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
    response.status(400).json({
      error: error.message
    });
  }
};

// Delete a post
const deletePost = async (request, response) => {
  try {
    // Find the post by its ID
    const post = await Post.findById(request.params.postId).exec();
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }
    // only user who created the post or admin can delete the post
    // user equals to find if the user is the same as the one who created the post
    // can not use === because you can not compare two objects, they are always different
    if (post.userId.equals(request.headers.userId) || request.headers.userRole == "admin") {
      const deletedPost = await Post.findByIdAndDelete(request.params.postId).exec();
      response.json({
        data: deletedPost
      });
    } else {
      const error = new Error("You are not authorized to delete this post.");
      error.statusCode = 403;
      throw error;
    }
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

// Update a post
const updatePost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.postId).exec();
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }
    if (!post.userId.equals(request.headers.userId)) {
      throw new Error("You are not authorized to update this post.");
    } else {
      // If the user is authorized to update the post, update the post with the provided data or keep the old data
      // Get files from the request

      const files = request.files;
      // Upload files to AWS S3 bucket and get the URLs
      const photos = await uploadFilesToS3(files);
      // get old photos from the request covert string to array
      let oldphotoList = [];
      if (request.body.oldphotos.length == 0) {
        oldphotoList = [];
      } else {
        oldphotoList = request.body.oldphotos.split(",");
      }

      const updatedData = {
        title: request.body.title || post.title,
        species: request.body.species || post.species,
        breed: request.body.breed || post.breed,
        color: request.body.color || post.color,
        description: request.body.description || post.description,
        suburb: request.body.suburb || post.suburb,
        contactInfo: request.body.contactInfo || post.contactInfo,
        status: request.body.status || post.status,
        photos: [...oldphotoList, ...photos]
      };

      const updatedPost = await Post.findByIdAndUpdate(request.params.postId, updatedData, {
        new: true
      }).exec();
      response.json({
        data: updatedPost
      });
    }
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

// Get all distinct values of a field
const filterPosts = async (request, response) => {
  try {
    const { status } = request.query;

    // Get distinct values of the 'status' field from the filtered posts
    const allStatus = await Post.distinct(status).exec();

    response.json({
      data: allStatus
    });
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

// Get all distinct breeds of each species
const getDistinctBreeds = async (request, response) => {
  try {
    const pipline = [
      {
        // Group by species and add all breeds of each species to an array
        $group: {
          _id: "$species",
          breeds: { $addToSet: "$breed" }
        }
      },
      // Project the data to remove the '_id' field and rename the '_id' field to 'species'
      {
        $project: {
          _id: 0,
          species: "$_id",
          breeds: 1
        }
      }
    ];

    const distinctBreeds = await Post.aggregate(pipline).exec();
    response.json({
      data: distinctBreeds
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
  filterPosts,
  getDistinctBreeds
};
