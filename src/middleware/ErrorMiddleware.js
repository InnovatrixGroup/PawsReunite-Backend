// This middleware checks if there are any errors in the request object.
const errorCheck = (req, res, next) => {
  if (req.errors.length > 0) {
    return res.status(400).json({ errors: req.errors });
  } else {
    next();
  }
};

module.exports = { errorCheck };
