const { User } = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const hashPassword = async (password) => {
  // Generate a random string and jumble it up X amount of times, where X is saltRounds.
  let saltToAdd = await bcrypt.genSalt(saltRounds);
  // Hash the password and attach the salt to it.
  let hashedPassword = await bcrypt.hash(password, saltToAdd);
  return hashedPassword;
};

const generateJWT = (userDetails) => {
  return jwt.sign(userDetails, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const signup = async (req, res) => {
  try {
    let hashedPassword = await hashPassword(req.body.password);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    await newUser.save();

    const userJWT = generateJWT({ username: newUser.username, email: newUser.email });
    res.json({ data: newUser, JWTtoken: userJWT });
  } catch (error) {
    res.json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}).exec();
    res.json({ data: allUsers });
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = { signup, generateJWT, getAllUsers };
