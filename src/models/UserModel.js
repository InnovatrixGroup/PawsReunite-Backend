// Importing the Mongoose library
const mongoose = require("mongoose");
const { Role } = require("./RoleModel");

// Defining a schema for the User model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: {
    type: mongoose.Types.ObjectId,
    ref: "Role",
    default: Role.findOne({ name: "regular" })._id
  },
  notifications: [{ type: mongoose.Types.ObjectId, ref: "Notification" }]
});

// Creating a model based on the User schema
const User = mongoose.model("User", UserSchema);

module.exports = User;
