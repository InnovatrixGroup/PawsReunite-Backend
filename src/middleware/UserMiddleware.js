const { checkSchema, validationResult } = require("express-validator");

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
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1
    }
  }
};

// the middleware to check if user's input is valid
const validateSignupInput = () => {
  return [
    checkSchema(checkSignupInputSchema),
    (req, res, next) => {
      const errors = validationResult(req);

      // push error messages to req.errors
      if (!errors.isEmpty()) {
        for (let error of errors.array()) {
          req.errors.push(error.msg);
        }
        next();
      }

      next();
    }
  ];
};

module.exports = { validateSignupInput };
