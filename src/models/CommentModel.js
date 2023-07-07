// Importing the Mongoose library
const mongoose = require("mongoose");

// Defining a schema for the Comment model
const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  postId: { type: mongoose.Types.ObjectId, ref: "Pet" },
  createdAt: { type: Date, default: Date.now }
});

// Creating a model based on the Comment schema
const Comment = mongoose.model("Comment", CommentSchema);

module.exports = { Comment };
