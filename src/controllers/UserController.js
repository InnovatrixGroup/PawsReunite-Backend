const User = require("../models/UserModel");

const signup = async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    // await user.save();
    res.json({ data: newUser });
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = { signup };
