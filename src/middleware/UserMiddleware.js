const { checkSchema, validationResult } = require("express-validator");
const { User } = require("../models/UserModel");

// express-validator schema to check if user's input is valid
const checkEmailSchema = {
  email: {
    errorMessage: "Please enter a valid email address",
    isEmail: true
  }
};

const checkPasswordStrengthSchema = {
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

// the middleware to check if user's email & password input is valid
const validateEmailAndPasswordInput = async (req, res, next) => {
  // run express-validator checkSchema
  if (req.body.email || req.body.email === "") {
    await checkSchema(checkEmailSchema, ["body"]).run(req);
  }

  if (req.body.password || req.body.password === "") {
    await checkSchema(checkPasswordStrengthSchema, ["body"]).run(req);
  }

  // if there is an error, push the error message to req.errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    for (let error of errors.array()) {
      req.errors.push(error.msg);
    }
  }

  next();
};

// the middleware to check if is an existing user
const checkIfIsExistingUser = async (req, res, next) => {
  // find a user with the same username or email
  let existingUsername = await User.findOne({ username: req.body.username }).exec();
  let existingEmail = await User.findOne({ email: req.body.email }).exec();

  // if a user with the same username or email exists, send an error message
  existingUsername && req.errors.push("Username already exists");
  existingEmail && req.errors.push("Email already exists");

  next();
};

module.exports = { validateEmailAndPasswordInput, checkIfIsExistingUser };
