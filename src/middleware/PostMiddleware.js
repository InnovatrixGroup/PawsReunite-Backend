const { body, validationResult } = require("express-validator");

// using [] to group multiple middleware into one middleware
const validateTitleLength = [
  body("title").isLength({ max: 10 }).withMessage("Title must be less than 10 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.errors.push(error.msg);
      }
    }
    next();
  }
];

module.exports = { validateTitleLength };
