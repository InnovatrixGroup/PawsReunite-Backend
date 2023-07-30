// Importing the Mongoose library
const mongoose = require("mongoose");

// Defining a schema for the Notification model
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  postId: { type: mongoose.Types.ObjectId, ref: "Post" },
  createdAt: { type: Date, default: Date.now }
});

// Creating a model based on the Notification schema
const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification };
