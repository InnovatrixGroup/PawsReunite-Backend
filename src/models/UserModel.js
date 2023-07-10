// Importing the Mongoose library
const mongoose = require("mongoose");
const { Role } = require("./RoleModel");

// Defining a schema for the User model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: mongoose.Types.ObjectId, ref: "Role" },
  notifications: [{ type: mongoose.Types.ObjectId, ref: "Notification" }]
});

// A pre-save hook to assign the "regular" role to a user if no role is specified
UserSchema.pre("save", async function (next) {
  const role = await Role.findOne({ name: "regular" });
  if (!this.roleId) {
    this.roleId = role._id;
  }
  next();
});

// Creating a model based on the User schema
const User = mongoose.model("User", UserSchema);

module.exports = { User };
