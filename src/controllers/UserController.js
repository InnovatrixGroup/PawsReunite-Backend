const { User } = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// a function to hash the user's password
const hashPassword = async (password) => {
  // Generate a random string and jumble it up X amount of times, where X is saltRounds.
  let saltToAdd = await bcrypt.genSalt(saltRounds);
  // Hash the password and attach the salt to it.
  let hashedPassword = await bcrypt.hash(password, saltToAdd);
  return hashedPassword;
};

// a function to generate a JWT token
const generateJWT = (userDetails) => {
  return jwt.sign(userDetails, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// for signup route
const signup = async (req, res) => {
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
    const userJWT = generateJWT({ username: newUser.username, email: newUser.email });
    res.json({ data: newUser, JWTtoken: userJWT });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// for login route
const signin = async (req, res) => {
  try {
    // check if user exists
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ error: "User does not exist" });
    }

    // compare password
    let passwordMatch = await bcrypt.compare(req.body.password, user.password);
    // if password is incorrect, send an error message. otherwise, generate a JWT token and send it back to the client.
    if (!passwordMatch) {
      res.status(400).json({ error: "Password is incorrect" });
    } else {
      const userJWT = generateJWT({ username: user.username, email: user.email });
      res.json({ data: user, JWTtoken: userJWT });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, signin };
