const Joi = require("joi");
const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  lastName: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  email: {
    type: String,
    minlength: 2,
    maxlength: 50,
    unique: true,
    required: true
  }
});

const Author = mongoose.model("Author", authorSchema);

function validateAuthor(author) {
  const schema = {
    firstName: Joi.string()
      .required()
      .min(2)
      .required()
      .max(50)
      .required(),
    lastName: Joi.string()
      .min(2)
      .max(50),
    email: Joi.string()
      .required()
      .min(2)
      .required()
      .max(50)
      .required()
  };

  return Joi.validate(author, schema);
}

module.exports.authorSchema = authorSchema;
module.exports.Author = Author;
module.exports.validate = validateAuthor;
