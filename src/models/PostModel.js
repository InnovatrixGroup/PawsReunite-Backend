// Importing the Mongoose library
const mongoose = require("mongoose");

// Defining a schema for the Post model
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String },
  photos: [{ type: String }],
  suburb: { type: String, required: true },
  contactInfo: { type: String, required: true },
  status: { type: String, enum: ["lost", "found"], required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

// Creating a model based on the Post schema
const Post = mongoose.model("Post", PostSchema);

module.exports = { Post };
