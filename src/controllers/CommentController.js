const { Comment } = require("../models/CommentModel");

const getAllComments = async (request, response) => {
  try {
    const postId = request.query.postId;
    let allComments;
    if (postId) {
      allComments = await Comment.find({ postId: postId }).populate("userId").exec();
    } else {
      allComments = await Comment.find({}).exec();
    }
    response.json({
      data: allComments
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

const getSpecificComment = async (request, response) => {
  try {
    const comment = await Comment.findById(request.params.commentId).populate("userId").exec();
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }
    response.json({
      data: comment
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

const createComment = async (request, response) => {
  try {
    const newComment = new Comment({
      postId: request.params.postId,
      userId: request.headers.userId,
      content: request.body.content
    });
    const savedComment = await newComment.save();
    response.json({
      data: savedComment
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

const deleteComment = async (request, response) => {
  try {
    const comment = await Comment.findById(request.params.commentId).exec();
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }
    console.log(request.headers);
    // check if the user is the same as the user in the JWT token, or if the user is an admin
    if (comment.userId.equals(request.headers.userId) || request.headers.userRole == "admin") {
      const removedComment = await Comment.findByIdAndDelete(request.params.commentId).exec();
      response.json({
        data: removedComment
      });
    } else {
      const error = new Error("You are not authorized to delete this comment");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

module.exports = { getAllComments, getSpecificComment, createComment, deleteComment };
