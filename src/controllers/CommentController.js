const { Comment } = require("../models/CommentModel");

const getAllComments = async (request, response) => {
  try {
    const postId = request.query.postId;
    let allComments;
    if (postId) {
      allComments = await Comment.find({ postId: postId }).exec();
    } else {
      allComments = await Comment.find({}).exec();
    }
    response.json({
      data: allComments
    });
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

const getSpecificComment = async (request, response) => {
  try {
    const comment = await Comment.findById(request.params.commentId).exec();
    if (!comment) {
      throw new Error("Comment not found");
    }
    response.json({
      data: comment
    });
  } catch (error) {
    response.json({
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
    response.json({
      error: error.message
    });
  }
};

const deleteComment = async (request, response) => {
  try {
    const comment = await Comment.findById(request.params.commentId).exec();
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.userId.equals(request.headers.userId) === false) {
      throw new Error("You are not authorized to delete this comment");
    }
    const removedComment = await Comment.findByIdAndDelete(request.params.commentId).exec();
    response.json({
      data: removedComment
    });
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

module.exports = { getAllComments, getSpecificComment, createComment, deleteComment };
