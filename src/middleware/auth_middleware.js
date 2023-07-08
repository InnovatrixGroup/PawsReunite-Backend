const bcrypt = require("bcrypt");
const saltRounds = 10;

const hashPassword = async (req, res, next) => {
  // Generate a random string and jumble it up X amount of times, where X is saltRounds.
  let saltToAdd = await bcrypt.genSalt(saltRounds);
  // Hash the password and attach the salt to it.
  req.body.password = await bcrypt.hash(req.body.password, saltToAdd);

  next();
};

module.exports = { hashPassword };
