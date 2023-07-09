const { User } = require("../models/UserModel");
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
      id: newUser._id,
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
        id: user._id,
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
    // hash the password if the user has entered a new password
    let hashedPassword;
    if (req.password) {
      hashedPassword = await hashPassword(req.password);
    }

    //todo: add middleware to handle jwt validation

    // Create a new object with the user's new details
    let newDetails = {
      username: req.body.username || req.userAuthDetails.username,
      email: req.body.email || req.userAuthDetails.email,
      password: hashedPassword || req.userAuthDetails.password
    };

    // Update the user's details
    await User.findOneAndUpdate({ email: req.userAuthDetails.email }, newDetails, { new: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, signin, editProfile };
