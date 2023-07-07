// Importing the Mongoose library
const mongoose = require("mongoose");

// Defining a schema for the Role model
const RoleSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String }
});

// Creating a model based on the Role schema
const Role = mongoose.model("Role", RoleSchema);

module.exports = { Role };
