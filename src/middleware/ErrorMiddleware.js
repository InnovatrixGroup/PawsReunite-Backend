const errorCheck = (req, res, next) => {
  if (req.errors.length > 0) {
    res.status(400).json({
      errors: req.errors
    });
  } else {
    next();
  }
};

module.exports = { errorCheck };
