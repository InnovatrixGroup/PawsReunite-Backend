const { User } = require("../models/UserModel");
const { Post } = require("../models/PostModel");
const { Comment } = require("../models/CommentModel");
const { hashPassword, generateUserJWT, validateHashedData } = require("../services/auth_services");

// for signup route
const signup = async (req, res, next) => {
  try {
    // hash the password
    let hashedPassword = await hashPassword(req.body.password);

    // create a new user and save it to the database
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    await newUser.save();

    // generate a JWT token and send it back to the client
    const userJWT = await generateUserJWT({
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email
    });
    return res.json({ userId: newUser._id, JWTtoken: userJWT });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// for login route
const signin = async (req, res) => {
  try {
    // check if user exists
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // compare password
    let passwordMatch = await validateHashedData(req.body.password || "", user.password);
    // if password is incorrect, send an error message. otherwise, generate a JWT token and send it back to the client.
    if (!passwordMatch) {
      return res.status(400).json({ error: "Password is incorrect" });
    } else {
      const userJWT = await generateUserJWT({
        userId: user._id,
        username: user.username,
        email: user.email
      });
      return res.json({ userId: user._id, JWTtoken: userJWT });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// for edit profile route
const editProfile = async (req, res) => {
  try {
    let currentUser = req.headers.user;
    // check if username or email already exists
    let existingUsername, existingEmail;
    if (req.body.username) {
      existingUsername = await User.findOne({ username: req.body.username }).exec();
    }
    if (req.body.email) {
      existingEmail = await User.findOne({ email: req.body.email }).exec();
    }

    // if username or email already exists, send an error message
    if (existingEmail && !existingEmail._id.equals(currentUser._id)) {
      console.log(existingEmail, currentUser);
      return res.status(400).json({ error: "Email already exists" });
    }
    if (existingUsername && !existingUsername._id.equals(currentUser._id)) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // hash the password if the user has entered a new password
    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await hashPassword(req.body.password);
    }

    // Create a new object with the user's new details
    let newDetails = {
      username: req.body.username || currentUser.username,
      email: req.body.email || currentUser.email,
      password: hashedPassword || currentUser.password
    };

    // Update the user's details
    await User.findByIdAndUpdate(currentUser._id, newDetails, { new: true });
    let newJWT = await generateUserJWT({
      userId: currentUser._id,
      username: currentUser.username,
      email: currentUser.email
    });

    return res.json({
      message: "User details updated successfully",
      updatedDetails: { username: newDetails.username, email: newDetails.email },
      newJWT: newJWT
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    let users = await User.find({}).exec();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// TODO: need logic to delete all posts and comments by the user
const deleteUser = async (req, res) => {
  try {
    let userToDelete = await User.findByIdAndDelete(req.params.userId).exec();
    // delete all posts and comments by the user
    let postsToDelete = await Post.deleteMany({ userId: req.params.userId }).exec();
    let commentsToDelete = await Comment.deleteMany({ userId: req.params.userId }).exec();

    // if user is not found, send an error message
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAccountDetails = async (req, res) => {
  try {
    let userToCheck = await User.findById(req.params.userId).exec();

    // if user is not found, send an error message
    // if user is found, check if the user is the same as the user in the JWT token
    if (!userToCheck) {
      return res.status(404).json({ error: "User not found" });
    } else if (userToCheck._id.equals(req.headers.user._id)) {
      let user = userToCheck.toObject();
      user.role = req.headers.userRole;
      return res.json(user);
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, signin, editProfile, getAllUsers, deleteUser, getAccountDetails };
