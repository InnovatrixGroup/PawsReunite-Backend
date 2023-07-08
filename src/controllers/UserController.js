const { User } = require("../models/UserModel");
const jwt = require("jsonwebtoken");

const generateJWT = (userDetails) => {
  return jwt.sign(userDetails, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const signup = async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    await newUser.save();

    const userJWT = generateJWT({ username: newUser.username, email: newUser.email });
    res.json({ data: newUser, JWTtoken: userJWT });
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = { signup };
