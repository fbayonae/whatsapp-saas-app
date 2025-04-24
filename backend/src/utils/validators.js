const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: errors.array()
    });
  }
  next();
};

module.exports = validate;
