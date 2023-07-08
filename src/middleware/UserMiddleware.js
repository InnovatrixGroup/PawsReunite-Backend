const { checkSchema, validationResult } = require("express-validator");
const User = require("../models/UserModel");

// a express-validator schema to check if user's input is valid
const checkSignupInputSchema = {
  email: {
    errorMessage: "Please enter a valid email address",
    isEmail: true
  },
  password: {
    errorMessage:
      "Password must be at least 8 characters long, contain at least 1 lowercase letter and 1 uppercase letter",
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 0,
        minNumbers: 0
      }
    }
  }
};

// the middleware to check if user's input is valid
const validateSignupInput = async (req, res, next) => {
  const result = await checkSchema(checkSignupInputSchema).run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    for (let error of errors.array()) {
      req.errors.push(error.msg);
    }
  }

  next();
};

// the middleware to check if is an existing user
const validateExistingUser = async (req, res, next) => {
  const existingUsername = await User.findOne({ username: req.body.username });
  const existingEmail = await User.findOne({ email: req.body.email });

  existingUsername && req.errors.push("Username already exists");
  existingEmail && req.errors.push("Email already exists");

  next();
};

module.exports = { validateSignupInput, validateExistingUser };
